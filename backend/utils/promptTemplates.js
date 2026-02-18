// ===============================
// QUESTION GENERATION PROMPT
// ===============================
exports.getQuestionPrompt = (domain, level) => `
You are a professional interviewer.

Generate ONLY 4 interview questions.

Domain: ${domain}
Level: ${level}

Rules:
- Clear
- One line each
- No numbering
- Return JSON array

Example:
["Q1","Q2","Q3","Q4"]
`;


// ===============================
// ANSWER EVALUATION PROMPT
// ===============================
exports.getEvaluationPrompt = (question, answer) => `
You are an interview evaluator.

Question:
${question}

Answer:
${answer}

Score:
- accuracy (1-10)
- fluency (1-10)
- confidence (1-10)

Return ONLY JSON:
{
 "accuracy": number,
 "fluency": number,
 "confidence": number,
 "feedback": ""
}
`;


// ===============================
// FINAL REPORT PROMPT
// ===============================
exports.getFinalReportPrompt = (acc, flu, conf) => `
You are a senior interview coach.

Scores:
Accuracy: ${acc}
Fluency: ${flu}
Confidence: ${conf}

Return JSON:
{
 "strengths": [],
 "improvements": [],
 "finalFeedback": ""
}
`;
