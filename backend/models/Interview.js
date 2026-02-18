const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema(
  {
    question: String,
    answer: { type: String, default: "" },
    accuracy: { type: Number, default: 0 },
    fluency: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    feedback: { type: String, default: "" },
    duration: { type: Number, default: 0 },
  },
  { _id: false }
);

const interviewSchema = new mongoose.Schema(
  {
    userId: { type: String, default: "guest" },
    domain: { type: String, required: true },
    level: { type: String, required: true },
    questions: { type: [String], required: true },
    responses: { type: [responseSchema], default: [] },
    overallScore: { type: Number, default: 0 },
    status: { type: String, enum: ["started", "completed"], default: "started" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);
