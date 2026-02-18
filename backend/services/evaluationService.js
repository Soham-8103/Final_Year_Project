exports.calculateAverages = (responses) => {
  if (!responses.length) {
    return {
      avgAccuracy: 0,
      avgFluency: 0,
      avgConfidence: 0,
      overall: 0
    };
  }

  let acc = 0;
  let flu = 0;
  let conf = 0;

  responses.forEach(r => {
    acc += r.accuracy || 0;
    flu += r.fluency || 0;
    conf += r.confidence || 0;
  });

  const total = responses.length;

  const avgAccuracy = acc / total;
  const avgFluency = flu / total;
  const avgConfidence = conf / total;
  const overall = (avgAccuracy + avgFluency + avgConfidence) / 3;

  return {
    avgAccuracy,
    avgFluency,
    avgConfidence,
    overall
  };
};
