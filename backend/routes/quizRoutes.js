const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1"
});


// =============================
// GENERATE QUIZ
// =============================
router.post("/generate-quiz", async (req, res) => {
  try {
    const { domain, difficulty, count } = req.body;

    const prompt = `
Generate ${count} MCQ questions for ${domain} (${difficulty} level).

STRICT RULES:
- Return ONLY JSON array
- Each question must have:
  question
  options (4)
  correctAnswer (MUST be EXACT option text)
  explanation

FORMAT:
[
 {
  "question": "...",
  "options": ["opt1","opt2","opt3","opt4"],
  "correctAnswer": "opt1",
  "explanation": "..."
 }
]
`;

    const completion = await client.chat.completions.create({
      model: "mistralai/mistral-7b-instruct",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5
    });

    let text = completion.choices[0].message.content;

    // remove markdown
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const questions = JSON.parse(text);

    // 🔥 SAFE VALIDATION
    const validQuestions = questions.map((q) => {
      // if AI returned A/B/C/D → convert to text
      if (!q.options.includes(q.correctAnswer)) {
        const map = { A:0, B:1, C:2, D:3 };
        const index = map[q.correctAnswer?.trim()];
        if (index !== undefined) {
          q.correctAnswer = q.options[index];
        } else {
          // fallback
          q.correctAnswer = q.options[0];
        }
      }
      return q;
    });

    res.json({
      success: true,
      questions: validQuestions
    });

  } catch (err) {
    console.log("Quiz error:", err.message);
    res.json({
      success: false,
      error: "AI generation failed"
    });
  }
});


// =============================
router.post("/quit-quiz", (req, res) => {
  res.json({ success: true });
});

module.exports = router;
