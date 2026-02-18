const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const OpenAI = require("openai");

const router = express.Router();

//////////////////////////////////////////////////////////////
// Multer
//////////////////////////////////////////////////////////////
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

//////////////////////////////////////////////////////////////
// OPENROUTER CLIENT
//////////////////////////////////////////////////////////////
const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

//////////////////////////////////////////////////////////////
// SAFE JSON PARSER
//////////////////////////////////////////////////////////////
function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      try {
        return JSON.parse(text.substring(start, end + 1));
      } catch {}
    }
    return null;
  }
}

//////////////////////////////////////////////////////////////
// FALLBACK
//////////////////////////////////////////////////////////////
function fallback() {
  return {
    overallScore: 60,
    categoryScores: {
      formatAndStructure: 60,
      contentQuality: 60,
      keywordOptimization: 60,
      experiencePresentation: 60,
      skillsAssessment: 60,
    },
    strengths: ["Basic structure present"],
    weaknesses: ["Needs better keywords"],
    formattingTips: ["Use bullet points"],
    actionableSuggestions: ["Add projects"],
    keywordSuggestions: ["React", "Node", "SQL"],
  };
}

//////////////////////////////////////////////////////////////
// ANALYZE ROUTE
//////////////////////////////////////////////////////////////
router.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let text = "";

    // Extract text
    if (req.file.mimetype === "application/pdf") {
      text = (await pdfParse(req.file.buffer)).text;
    } else {
      text = (await mammoth.extractRawText({ buffer: req.file.buffer })).value;
    }

    if (!text.trim()) {
      return res.status(400).json({ error: "Empty resume" });
    }

    const jobRole = req.body.jobRole || "General";

    //////////////////////////////////////////////////////////////
    // PROMPT
    //////////////////////////////////////////////////////////////
    const prompt = `
Analyze this resume for ${jobRole}.

RETURN ONLY JSON:

{
  "overallScore": number,
  "categoryScores": {
    "formatAndStructure": number,
    "contentQuality": number,
    "keywordOptimization": number,
    "experiencePresentation": number,
    "skillsAssessment": number
  },
  "strengths": string[],
  "weaknesses": string[],
  "formattingTips": string[],
  "actionableSuggestions": string[],
  "keywordSuggestions": string[]
}

Resume:
${text}
`;

    //////////////////////////////////////////////////////////////
    // OPENROUTER CALL
    //////////////////////////////////////////////////////////////
    const completion = await client.chat.completions.create({
      model: "mistralai/mistral-7b-instruct",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    let aiText = completion.choices[0].message.content;

    // remove markdown
    aiText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();

    let analysis = safeParse(aiText);

    if (!analysis) {
      console.log("AI JSON broken → fallback used");
      analysis = fallback();
    }

    //////////////////////////////////////////////////////////////
    // MAP FOR FRONTEND
    //////////////////////////////////////////////////////////////
    analysis.formatStructure = analysis.categoryScores.formatAndStructure;
    analysis.contentQuality = analysis.categoryScores.contentQuality;
    analysis.keywordsOptimization = analysis.categoryScores.keywordOptimization;
    analysis.experiencePresentation = analysis.categoryScores.experiencePresentation;
    analysis.skillsAssessment = analysis.categoryScores.skillsAssessment;

    res.json({ success: true, analysis });

  } catch (err) {
    console.log("Resume error:", err.message);
    res.status(500).json({ error: "Resume AI failed" });
  }
});

//////////////////////////////////////////////////////////////
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = router;
