const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

// ROUTES
const quizRoutes = require("./routes/quizRoutes");
const authRoutes = require("./routes/authRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const jobRoutes = require("./routes/jobRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();


// ================= DB =================
connectDB();


// ================= MIDDLEWARE =================

// CORS for React frontend

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5001"],
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// request logger (helps debugging interview flow)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});


// ================= ROUTES =================

app.use("/api/auth", authRoutes);
app.use("/api/mock-quiz", quizRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/jobs", jobRoutes);

// 🔥 AI INTERVIEW ROUTES
app.use("/api/interview", interviewRoutes);

// 🔥 REPORT ROUTE
app.use("/api/report", reportRoutes);


// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("🚀 AI Career Coach Backend Running");
});


// ================= 404 =================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});


// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message
  });
});


// ================= SERVER START =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🟢 Server running on port ${PORT}`);
});
