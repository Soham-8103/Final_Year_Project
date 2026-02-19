const express = require("express");
const router = express.Router();

const { generateInterview, evaluateAnswer } = require("../controllers/interviewController");

router.post("/generate", generateInterview);
router.post("/evaluate", evaluateAnswer);

module.exports = router;
