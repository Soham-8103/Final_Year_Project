const Interview = require("../models/Interview");
const openrouter = require("../config/openrouter");
const {
  getQuestionPrompt,
  getEvaluationPrompt,
  getFinalReportPrompt
} = require("../utils/promptTemplates");

// GENERATE INTERVIEW QUESTIONS
exports.generateInterview = async (req, res) => {
  try {
    const { domain, level, userId } = req.body;

    if (!domain || !level) {
      return res.status(400).json({
        success: false,
        message: "Domain and level are required"
      });
    }

    const prompt = getQuestionPrompt(domain, level);

    const aiResponse = await openrouter.post("/chat/completions", {
      model: process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You are a professional technical interviewer. Return ONLY valid JSON array of questions."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });

    let text = aiResponse.data.choices[0]?.message?.content || "";
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    let questions = [];

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        questions = parsed.slice(0, 4);
      }
    } catch {
      questions = text
        .split("\n")
        .map(q => q.replace(/^\d+[\).\s]/, "").trim())
        .filter(Boolean)
        .slice(0, 4);
    }

    if (!questions.length) {
      throw new Error("AI returned empty questions");
    }

    const interview = await Interview.create({
      userId: userId || "guest",
      domain,
      level,
      questions,
      responses: []
    });

    return res.json({
      success: true,
      interviewId: interview._id,
      questions
    });

  } catch (err) {
    console.error("❌ generateInterview error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to generate interview",
      error: err.message
    });
  }
};

// EVALUATE USER ANSWER AND SAVE
exports.evaluateAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, userAnswer } = req.body;

    if (!interviewId) {
      return res.status(400).json({
        success: false,
        message: "Interview ID required"
      });
    }

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found"
      });
    }

    const question = interview.questions[questionIndex];
    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question index invalid"
      });
    }

    const answerText = userAnswer && userAnswer.trim() !== "" ? userAnswer : "No answer";

    const prompt = getEvaluationPrompt(question, answerText);

    let scores = {
      accuracy: 5,
      fluency: 5,
      confidence: 5,
      feedback: "No feedback provided."
    };

    try {
      const aiRes = await openrouter.post("/chat/completions", {
        model: process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat",
        messages: [
          { role: "system", content: "You are an interview evaluator. Return ONLY valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3
      });

      let content = aiRes.data.choices[0]?.message?.content || "";
      content = content.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(content);

      scores = {
        accuracy: parsed.accuracy || 0,
        fluency: parsed.fluency || 0,
        confidence: parsed.confidence || 0,
        feedback: parsed.feedback || "No feedback provided."
      };

    } catch (err) {
      console.log("⚠ AI evaluation failed → using fallback scoring");
    }

    interview.responses[questionIndex] = {
      question,
      answer: answerText,
      accuracy: scores.accuracy,
      fluency: scores.fluency,
      confidence: scores.confidence,
      feedback: scores.feedback,
      duration: 0
    };

    await interview.save();

    return res.json({
      success: true,
      scores
    });

  } catch (err) {
    console.error("❌ evaluateAnswer error:", err);
    return res.status(500).json({
      success: false,
      message: "Evaluation failed",
      error: err.message
    });
  }
};

// GET FINAL INTERVIEW REPORT
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

    interview.calculateScores();
    interview.status = "completed";

    if (!interview.finalFeedback) {
      try {
        const prompt = getFinalReportPrompt(
          interview.averageAccuracy.toFixed(1),
          interview.averageFluency.toFixed(1),
          interview.averageConfidence.toFixed(1),
          interview.domain,
          interview.level
        );

        const response = await openrouter.post("/chat/completions", {
          model: process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.5
        });

        const content = response.data.choices[0]?.message?.content || "";
        const parsed = JSON.parse(content);

        interview.finalFeedback = parsed.finalFeedback || "Good attempt. Keep practicing.";
        interview.strengths = parsed.strengths || [];
        interview.improvements = parsed.improvements || [];

      } catch (err) {
        console.log("⚠ AI final report failed → using fallback");
        interview.finalFeedback =
          "Good attempt. Continue practicing to improve clarity and confidence.";
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
        finalFeedback: interview.finalFeedback,
        strengths: interview.strengths,
        improvements: interview.improvements,
        responses: interview.responses,
        createdAt: interview.createdAt
      }
    });

  } catch (err) {
    console.error("❌ Report error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to generate report",
      error: err.message
    });
  }
};
