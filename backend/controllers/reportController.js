const Interview = require("../models/Interview");
const openrouter = require("../config/openrouter");

exports.getInterviewReport = async (req, res) => {
  try {
    const interviewId = req.params.id;
    if (!interviewId) return res.status(400).json({ success: false, message: "Interview ID required" });

    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ success: false, message: "Interview not found" });

    interview.calculateScores();
    interview.status = "completed";

    if (!interview.finalFeedback) {
      try {
        const prompt = `
You are a senior interview coach.
Candidate performance summary:
Accuracy avg: ${interview.averageAccuracy.toFixed(1)}
Fluency avg: ${interview.averageFluency.toFixed(1)}
Confidence avg: ${interview.averageConfidence.toFixed(1)}
Domain: ${interview.domain}
Level: ${interview.level}
Return JSON:
{
  "strengths": [],
  "improvements": [],
  "finalFeedback": ""
}`;

        const response = await openrouter.post("/chat/completions", {
          model: process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.5
        });

        const content = response.data.choices[0]?.message?.content || "{}";
        let parsed;
        try { parsed = JSON.parse(content); } catch { parsed = {}; }

        interview.finalFeedback = parsed.finalFeedback || "Good attempt. Keep practicing.";
        interview.strengths = Array.isArray(parsed.strengths) ? parsed.strengths : [];
        interview.improvements = Array.isArray(parsed.improvements) ? parsed.improvements : [];
      } catch {
        interview.finalFeedback = "Good attempt. Continue practicing to improve clarity and confidence.";
        interview.strengths = [];
        interview.improvements = [];
      }
    }

    await interview.save();

    return res.json({
      success: true,
      report: {
        interviewId: interview._id,
        domain: interview.domain,
        level: interview.level,
        overallScore: Number(interview.overallScore.toFixed(1)),
        accuracy: Number(interview.averageAccuracy.toFixed(1)),
        fluency: Number(interview.averageFluency.toFixed(1)),
        confidence: Number(interview.averageConfidence.toFixed(1)),
        responses: interview.responses,
        finalFeedback: interview.finalFeedback,
        strengths: interview.strengths,
        improvements: interview.improvements,
        createdAt: interview.createdAt
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to generate report", error: err.message });
  }
};
