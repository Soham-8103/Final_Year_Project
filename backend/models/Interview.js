const mongoose = require("mongoose");

// Schema for each answer/response
const responseSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      default: ""
    },
    accuracy: {
      type: Number,
      default: 0
    },
    fluency: {
      type: Number,
      default: 0
    },
    confidence: {
      type: Number,
      default: 0
    },
    feedback: {
      type: String,
      default: ""
    },
    duration: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

// Main Interview Schema
const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: "guest"
    },
    domain: {
      type: String,
      required: true
    },
    level: {
      type: String,
      required: true
    },
    questions: {
      type: [String],
      required: true
    },
    responses: {
      type: [responseSchema],
      default: []
    },
    averageAccuracy: {
      type: Number,
      default: 0
    },
    averageFluency: {
      type: Number,
      default: 0
    },
    averageConfidence: {
      type: Number,
      default: 0
    },
    overallScore: {
      type: Number,
      default: 0
    },
    finalFeedback: {
      type: String,
      default: ""
    },
    strengths: {
      type: [String],
      default: []
    },
    improvements: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ["started", "completed"],
      default: "started"
    }
  },
  { timestamps: true }
);

// Method to calculate averages and overall score
interviewSchema.methods.calculateScores = function () {
  if (!this.responses || this.responses.length === 0) {
    this.averageAccuracy = 0;
    this.averageFluency = 0;
    this.averageConfidence = 0;
    this.overallScore = 0;
    return;
  }

  let totalAccuracy = 0;
  let totalFluency = 0;
  let totalConfidence = 0;

  this.responses.forEach((r) => {
    totalAccuracy += r.accuracy || 0;
    totalFluency += r.fluency || 0;
    totalConfidence += r.confidence || 0;
  });

  const count = this.responses.length;

  this.averageAccuracy = totalAccuracy / count;
  this.averageFluency = totalFluency / count;
  this.averageConfidence = totalConfidence / count;

  this.overallScore = (this.averageAccuracy + this.averageFluency + this.averageConfidence) / 3;
};

module.exports = mongoose.model("Interview", interviewSchema);
