// src/utils/evaluateAnswer.js

export const evaluateAnswer = (userAnswer, expectedPoints) => {
  if (!userAnswer || userAnswer.trim().length === 0) {
    return {
      accuracy: 0,
      fluency: 0,
      confidence: 0,
      suggestions: ["No answer provided. Please try to answer clearly next time."],
    };
  }

  const answerLower = userAnswer.toLowerCase();

  // --------- 1️⃣ Accuracy (keyword match) ---------
  let matchCount = 0;
  expectedPoints.forEach(point => {
    if (answerLower.includes(point.toLowerCase())) matchCount++;
  });
  const accuracy = Math.min(100, Math.round((matchCount / expectedPoints.length) * 100));

  // Suggestions for missing points
  const missingPoints = expectedPoints.filter(
    point => !answerLower.includes(point.toLowerCase())
  );
  const suggestions = missingPoints.length
    ? missingPoints.map(mp => `You could mention "${mp}" for a more complete answer.`)
    : ["Great answer!"];

  // --------- 2️⃣ Fluency (filler word detection) ---------
  const fillers = ["um", "uh", "like", "you know", "so", "actually", "basically"];
  const words = answerLower.split(/\s+/);
  const fillerCount = words.filter(w => fillers.includes(w)).length;
  // Fluency score decreases with filler words, minimum 30%
  const fluency = Math.max(30, Math.round(100 - fillerCount * 10));

  // --------- 3️⃣ Confidence (hedging words / assertiveness) ---------
  const hedges = ["maybe", "guess", "perhaps", "not sure", "I think", "I believe"];
  const hedgeCount = words.filter(w => hedges.some(h => w.includes(h))).length;
  const baseConfidence = Math.min(100, Math.round(userAnswer.length / 100 * 100));
  // Deduct points for hedging words
  const confidence = Math.max(20, baseConfidence - hedgeCount * 10);

  return {
    accuracy,
    fluency,
    confidence,
    suggestions
  };
};
