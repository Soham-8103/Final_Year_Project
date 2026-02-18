const express = require("express");
const router = express.Router();

// IMPORT controller correctly
const { generateInterview, evaluateAnswer } = require("../controllers/interviewController");

// Start interview: generate questions
router.post("/generate", generateInterview);

// Save answer + evaluate
router.post("/evaluate", evaluateAnswer);

module.exports = router;
