// testInterview.js
const axios = require("axios");

const API = "http://localhost:5000/api/interview/generate";

async function testGenerateInterview() {
  try {
    const payload = {
      domain: "DSA",       // change domain if you like
      level: "Beginner",   // change level if you like
      userId: "testuser"
    };

    const res = await axios.post(API, payload, {
      headers: { "Content-Type": "application/json" }
    });

    console.log("✅ Interview generated successfully!");
    console.log("Interview ID:", res.data.interviewId);
    console.log("Questions:");
    res.data.questions.forEach((q, i) => {
      console.log(`${i + 1}. ${q}`);
    });
  } catch (err) {
    console.error("❌ Error generating interview:", err.response?.data || err.message);
  }
}

testGenerateInterview();
