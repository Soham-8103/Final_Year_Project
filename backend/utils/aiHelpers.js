const ai = require("../config/openrouter");

// Generate 4 interview questions using AI
exports.generateQuestionsAI = async (domain, level) => {
  const prompt = `
You are a professional interviewer.
Generate exactly 4 interview questions.
Domain: ${domain}
Level: ${level}
Return JSON array only like ["Q1", "Q2", "Q3", "Q4"].
  `;

  try {
    const res = await ai.post("/chat/completions", {
      model: process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat",
      messages: [
        { role: "system", content: "You are a professional AI interviewer." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const text = res.data.choices[0].message.content.trim();

    // Robust parsing
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed.slice(0, 4) : text.split("\n").slice(0, 4);
    } catch {
      return text.split("\n").slice(0, 4);
    }
  } catch (err) {
    console.error("❌ AI generateQuestions error:", err.response?.data || err.message);
    throw new Error("Failed to generate AI questions");
  }
};
