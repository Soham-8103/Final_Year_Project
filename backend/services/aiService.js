const ai = require("../config/openrouter");
const {
  getQuestionPrompt,
  getEvaluationPrompt,
  getFinalReportPrompt
} = require("../utils/promptTemplates");


// =====================================================
// GENERATE QUESTIONS
// =====================================================
exports.generateQuestionsAI = async (domain, level) => {
  try {
    const prompt = getQuestionPrompt(domain, level);

    const res = await ai.post("/chat/completions", {
      model: process.env.OPENROUTER_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a professional technical interviewer. Return ONLY JSON."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });

    const text = res.data.choices[0].message.content.trim();

    try {
      return JSON.parse(text).slice(0, 4);
    } catch {
      return text.split("\n").filter(Boolean).slice(0, 4);
    }
  } catch (err) {
    console.log("❌ AI generateQuestions error:");
    console.log(err.response?.data || err.message);
    throw err;
  }
};


// =====================================================
// EVALUATE ANSWER
// =====================================================
exports.evaluateAnswerAI = async (question, answer) => {
  try {
    const prompt = getEvaluationPrompt(question, answer);

    const res = await ai.post("/chat/completions", {
      model: process.env.OPENROUTER_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an interview evaluator. Return ONLY valid JSON."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.3
    });

    return JSON.parse(res.data.choices[0].message.content);
  } catch (err) {
    console.log("❌ AI evaluateAnswer error:");
    console.log(err.response?.data || err.message);
    throw err;
  }
};


// =====================================================
// FINAL REPORT AI
// =====================================================
exports.generateFinalReportAI = async (acc, flu, conf) => {
  try {
    const prompt = getFinalReportPrompt(acc, flu, conf);

    const res = await ai.post("/chat/completions", {
      model: process.env.OPENROUTER_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You generate professional interview reports. Return ONLY JSON."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.5
    });

    return JSON.parse(res.data.choices[0].message.content);
  } catch (err) {
    console.log("❌ AI finalReport error:");
    console.log(err.response?.data || err.message);
    throw err;
  }
};
