// ==============================================
// utils/promptTemplates.js
// Professional Dynamic Prompt Templates
// ==============================================

// Normalize domain names to avoid AI confusion
const normalizeDomain = (domain) => {
  if (!domain) return "General Programming";

  const map = {
    dsa: "Data Structures and Algorithms",
    dbms: "Database Management Systems",
    react: "React.js Frontend Development",
    node: "Node.js Backend Development",
    "it fundamentals": "Computer Science Fundamentals",
    os: "Operating Systems",
    cn: "Computer Networks"
  };

  const key = domain.toLowerCase().trim();
  return map[key] || domain;
};

// Normalize difficulty level
const normalizeLevel = (level) => {
  if (!level) return "Beginner";

  const map = {
    beginner: "Beginner (basic concepts, definitions, simple examples)",
    intermediate: "Intermediate (practical scenarios, moderate difficulty)",
    advanced: "Advanced (real-world problems, optimization, system design)"
  };

  const key = level.toLowerCase().trim();
  return map[key] || level;
};



// =======================================================
// 🎯 QUESTION GENERATION PROMPT (MOST IMPORTANT)
// =======================================================
exports.getQuestionPrompt = (domain, level) => {
  const normalizedDomain = normalizeDomain(domain);
  const normalizedLevel = normalizeLevel(level);

  return `
You are a senior ${normalizedDomain} interviewer.

Your task is to generate a realistic mock interview.

Interview Configuration:
- Domain: ${normalizedDomain}
- Difficulty: ${normalizedLevel}
- Total Questions: 4

Rules:
- Questions MUST be strictly from ${normalizedDomain}
- Match difficulty to ${normalizedLevel}
- Ask like a real interviewer
- Keep each question 1-2 lines
- No numbering
- No explanations
- No headings
- No markdown
- Do NOT repeat common generic questions
- Avoid DSA questions unless domain is DSA

Return ONLY valid JSON array:
["Question 1","Question 2","Question 3","Question 4"]
`;
};



// =======================================================
// 🧠 ANSWER EVALUATION PROMPT
// =======================================================
exports.getEvaluationPrompt = (question, answer) => {
  return `
You are a strict technical interviewer evaluating a candidate.

Question:
${question}

Candidate Answer:
${answer}

Evaluate the answer professionally.

Scoring Rules:
- Accuracy (1-10)
- Fluency (1-10)
- Confidence (1-10)

Return ONLY valid JSON:
{
  "accuracy": number,
  "fluency": number,
  "confidence": number,
  "feedback": "Short constructive feedback"
}
`;
};



// =======================================================
// 📊 FINAL REPORT PROMPT
// =======================================================
exports.getFinalReportPrompt = (acc, flu, conf, domain, level) => {
  return `
You are a senior technical interview coach.

Candidate Interview Summary:
- Domain: ${domain}
- Level: ${level}
- Accuracy Avg: ${acc}
- Fluency Avg: ${flu}
- Confidence Avg: ${conf}

Write a professional final interview report.

Return ONLY JSON:
{
  "strengths": ["point1","point2"],
  "improvements": ["point1","point2"],
  "finalFeedback": "Overall professional summary"
}
`;
};

