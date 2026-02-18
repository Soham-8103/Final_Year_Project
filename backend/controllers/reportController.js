const Interview = require("../models/Interview");
const axios = require("axios");


// ================= OPENROUTER CLIENT =================
const ai = axios.create({
  baseURL: "https://openrouter.ai/api/v1",
  headers: {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json"
  },
  timeout: 30000
});


// =====================================================
// GET FINAL INTERVIEW REPORT
// =====================================================
exports.getInterviewReport = async (req, res) => {
  try {
    const interviewId = req.params.id;

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found"
      });
    }

    // ==========================================
    // CALCULATE SCORES IF NOT DONE
    // ==========================================
    interview.calculateScores();

    // mark completed
    interview.status = "completed";

    // ==========================================
    // GENERATE FINAL AI FEEDBACK
    // ==========================================
    let aiFeedback = interview.finalFeedback;

    if (!aiFeedback) {
      try {
        const prompt = `
You are a senior interview coach.

Candidate performance summary:
Accuracy avg: ${interview.averageAccuracy.toFixed(1)}
Fluency avg: ${interview.averageFluency.toFixed(1)}
Confidence avg: ${interview.averageConfidence.toFixed(1)}

Write a professional feedback report.

Return JSON:
{
 strengths: [],
 improvements: [],
 finalFeedback: ""
}
`;

        const response = await ai.post("/chat/completions", {
          model: process.env.OPENROUTER_MODEL,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.5
        });

        const content = response.data.choices[0].message.content;
        const parsed = JSON.parse(content);

        interview.finalFeedback = parsed.finalFeedback || "";
        interview.strengths = parsed.strengths || [];
        interview.improvements = parsed.improvements || [];

      } catch (err) {
        console.log("AI report failed → using fallback");
        interview.finalFeedback =
          "Good attempt. Continue practicing to improve clarity and confidence.";
      }
    }

    await interview.save();

    // ==========================================
    // SEND REPORT TO FRONTEND
    // ==========================================
    res.json({
      success: true,
      report: {
        interviewId: interview._id,
        domain: interview.domain,
        level: interview.level,

        overallScore: interview.overallScore.toFixed(1),
        accuracy: interview.averageAccuracy.toFixed(1),
        fluency: interview.averageFluency.toFixed(1),
        confidence: interview.averageConfidence.toFixed(1),

        responses: interview.responses,
        finalFeedback: interview.finalFeedback,
        createdAt: interview.createdAt
      }
    });

  } catch (err) {
    console.error("Report error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to generate report"
    });
  }
};
