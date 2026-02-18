const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Interview"
  },
  question: String,
  answer: String,
  accuracy: Number,
  fluency: Number,
  confidence: Number,
  feedback: String
});

module.exports = mongoose.model("Response", responseSchema);
