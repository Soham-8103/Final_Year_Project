import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Navbar from "../components/Navbar";
import "./Dashboard.css";
import resumeImg from "../assets/resume.jpg";
import interviewImg from "../assets/interview.jpg";
import jobsImg from "../assets/jobs.jpg";
import quizImg from "../assets/quiz.jpg";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Dashboard = () => {
  const userName = localStorage.getItem("userName") || "User";
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Score cards (dummy zero data for now)
  const scoreCards = [
    { title: "Daily Progress", score: 0, icon: "fa-chart-line" },
    { title: "Mock Test Score", score: 0, icon: "fa-laptop-code" },
    { title: "Interview Score", score: 0, icon: "fa-comments" },
  ];

  // Subject performance chart (dummy data)
  const subjectPerformance = [
    { subject: "DSA", score: 0 },
    { subject: "Web Dev", score: 0 },
    { subject: "AI/ML", score: 0 },
    { subject: "DBMS", score: 0 },
  ];

  // Participation data (dummy)
  const participationData = [
    { name: "Active Days", value: 0 },
    { name: "Inactive Days", value: 7 },
  ];

  const COLORS = ["#007bff", "#ff9800"];

  // Cards for navigation - SYNCED TO INTERVIEW-LOBBY
  const cards = [
    {
      title: "Resume Analyzer",
      description: "Analyze and improve your resume for better job opportunities.",
      link: "/resume-analyzer",
      cta: "Analyze My Resume",
      img: resumeImg,
    },
    {
      title: "Mock Interview",
      description: "Practice with AI-generated interview questions tailored to your domain.",
      link: "/interview-lobby",
      cta: "Start Interview",
      img: interviewImg,
    },
    {
      title: "Job Insights",
      description: "Explore salary trends, skills demand, and career paths.",
      link: "/job-insights",
      cta: "View Insights",
      img: jobsImg,
    },
    {
      title: "AI Technical Quiz",
      description: "Test your skills in DSA, Web Dev, AI/ML, and more with AI-powered quizzes.",
      link: "/ai-quiz",
      cta: "Start Quiz",
      img: quizImg,
    },
  ];

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await fetch("/api/todays-problems");
        const data = await res.json();
        setProblems(data.problems || []);
      } catch (error) {
        console.error("Error fetching problems:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  return (
    <>
      <Navbar showUserName={true} userName={userName} />
      <div className="dashboard-container">
        {/* Welcome Section */}
        <motion.h2
          className="dashboard-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Welcome back, {userName}!
        </motion.h2>
        <motion.p
          className="dashboard-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Here’s your current progress overview .
        </motion.p>

        {/* Performance Dashboard */}
        <motion.div
          className="performance-dashboard"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="score-cards">
            {scoreCards.map((card, idx) => (
              <motion.div
                key={idx}
                className="score-card"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <i className={`fas ${card.icon} score-icon`}></i>
                <h3>{card.title}</h3>
                <p>{card.score}</p>
              </motion.div>
            ))}
          </div>

          <div className="charts-section">
            <div className="chart-box">
              <h3>Subject Performance</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={subjectPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="subject" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip cursor={{ fill: "rgba(255,255,255,0.1)" }} />
                  <Bar dataKey="score" fill="#007bff" barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-box">
              <h3>Activity Participation</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={participationData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {participationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="dashboard-cards">
          {cards.map((card, idx) => (
            <motion.div
              className="dashboard-card"
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <motion.img
                src={card.img}
                alt={card.title}
                className="card-image"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.4 }}
              />
              <div className="dashboard-card-content">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
                  <Link to={card.link} className="cta-btn">
                    {card.cta}
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>


        {/* About Section */}
        <motion.div
          className="about-section"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <h2>About SensAI</h2>
          <p>
            We’re building an AI-powered platform to help students and professionals prepare
            for their dream careers. From smart resume analysis to realistic mock interviews,
            insightful job market analytics, and skill quizzes — we provide everything you
            need to succeed in your career journey.
          </p>
        </motion.div>

        {/* Footer */}
        <motion.footer
          className="footer"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
        >
          <p>© {new Date().getFullYear()} AI Career Coach. All rights reserved.</p>
          <div className="footer-socials">
            <a href="https://linkedin.com" target="_blank" rel="noreferrer">
              <i className="fab fa-linkedin"></i>
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer">
              <i className="fab fa-github"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              <i className="fab fa-twitter"></i>
            </a>
          </div>
        </motion.footer>
      </div>
    </>
  );
};

export default Dashboard;