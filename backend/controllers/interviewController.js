// controllers/interviewController.js
const Interview = require("../models/Interview");
const openrouter = require("../config/openrouter");
const { getQuestionPrompt } = require("../utils/promptTemplates");

// ===============================
// Generate Interview Questions
// ===============================
exports.generateInterview = async (req, res) => {
  try {
    const { domain, level, userId } = req.body;

    if (!domain || !level) {
      return res
        .status(400)
        .json({ success: false, message: "Domain and level are required" });
    }

    console.log(`🧠 Generating AI interview for ${domain} - ${level}`);

    // -----------------------------
    // 1️⃣ Build prompt for AI
    // -----------------------------
    const prompt = getQuestionPrompt(domain, level);

    // -----------------------------
    // 2️⃣ Call OpenRouter API
    // -----------------------------
    const response = await openrouter.post("/chat/completions", {
      model: process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You are a professional technical interviewer. Return ONLY JSON."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });

    let text = response.data.choices[0]?.message?.content || "";

    // -----------------------------
    // 3️⃣ Strip code fences if AI returned them
    // -----------------------------
    text = text.replace(/```(?:json)?\s*([\s\S]*?)```/, "$1").trim();

    // -----------------------------
    // 4️⃣ Parse JSON robustly
    // -----------------------------
    let questions = [];
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        questions = parsed.slice(0, 4).map(q => q.toString());
      }
    } catch {
      // fallback: split by lines if JSON parsing fails
      questions = text
        .split("\n")
        .map(q => q.replace(/^\d+[\).\s]/, "").trim())
        .filter(Boolean)
        .slice(0, 4);
    }

    if (questions.length === 0) {
      throw new Error("AI returned empty questions");
    }

    // -----------------------------
    // 5️⃣ Save to DB (optional)
    // -----------------------------
    const interview = await Interview.create({
      userId: userId || "guest",
      domain,
      level,
      questions,
      responses: []
    });

    console.log("✅ Interview created:", interview._id);

    // -----------------------------
    // 6️⃣ Return to frontend
    // -----------------------------
    return res.json({ success: true, interviewId: interview._id, questions });

  } catch (err) {
    console.error("❌ generateInterview error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to generate interview",
      error: err.message
    });
  }
};

// ===============================
// Evaluate User Answer (mock for now)
// ===============================
exports.evaluateAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, userAnswer } = req.body;

    console.log("✅ Received answer:", { interviewId, questionIndex, userAnswer });

    // TODO: You can call AI here to evaluate answer

    return res.json({ success: true, message: "Answer recorded" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
