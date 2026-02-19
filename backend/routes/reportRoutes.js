const express = require("express");
const router = express.Router();

const { getInterviewReport } = require("../controllers/reportController");

router.get("/:id", getInterviewReport);

module.exports = router;
