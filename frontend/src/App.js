import React from "react";
import { Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MockQuiz from "./pages/MockQuiz";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import JobInsights from "./pages/JobInsights";
import InterviewLobby from "./pages/InterviewLobby";
import InterviewRoom from "./pages/InterviewRoom";
import InterviewReport from "./pages/InterviewReport";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
      <Route path="/ai-quiz" element={<MockQuiz />} />
      <Route path="/job-insights" element={<JobInsights />} />

      <Route path="/interview-lobby" element={<InterviewLobby />} />
      <Route path="/mock-interview" element={<InterviewLobby />} />

      <Route path="/interview-room" element={<InterviewRoom />} />

      {/* ✅ FIXED ROUTE */}
      <Route path="/interview-report/:id" element={<InterviewReport />} />
    </Routes>
  );
}

export default App;
