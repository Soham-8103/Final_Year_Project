import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Auth.css";
import signupIllustration from "../assets/signup-illustration.png";
import { FaFileAlt, FaLaptopCode, FaRobot, FaCalculator } from "react-icons/fa";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", formData);

      // Save name for future use
      localStorage.setItem("userName", formData.name);

      navigate("/login");
    } catch (err) {
      setError("Failed to create account. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      {/* Left Section */}
      <div className="auth-left">
        <img
          src={signupIllustration}
          alt="AI Career Coach"
          className="illustration"
        />
        <h2>Why Join AI Career Coach?</h2>
        <p>
          Unlock your career potential with AI-powered tools designed for
          students and job seekers.
        </p>
        <div className="feature-list">
          <div className="feature-item">
            <FaFileAlt className="feature-icon" />
            <span>AI Resume Analyzer with actionable feedback</span>
          </div>
          <div className="feature-item">
            <FaLaptopCode className="feature-icon" />
            <span>Mock Tests for DSA, Web Dev, AI/ML & Cloud</span>
          </div>
          <div className="feature-item">
            <FaRobot className="feature-icon" />
            <span>AI Career Coach for role suggestions & roadmap</span>
          </div>
          <div className="feature-item">
            <FaCalculator className="feature-icon" />
            <span>
              Aptitude & Math practice with step-by-step solutions
            </span>
          </div>
        </div>
      </div>

      {/* Right Section - Signup Form */}
      <div className="auth-right">
        <div className="auth-card">
          <h2>Create Your Account</h2>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button type="submit" className="auth-btn">
              Sign Up
            </button>
          </form>
          <p className="switch-auth">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
