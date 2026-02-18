import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Login.css";
import loginIllustration from "../assets/login-illustration.png";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);

      // ✅ Save token + full name from backend response
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userName", res.data.name);

      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials, please try again.");
    }
  };

  return (
    <div className="login-page">
      {/* Left Section */}
      <div className="login-left">
        <div className="login-box">
          <h1 className="brand-name">AI Career Coach</h1>
          <h2>Welcome Back</h2>
          <p className="subtitle">Your AI-powered guide to career growth</p>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email address"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button type="submit" className="login-btn">Sign in</button>
          </form>

          <p className="signup-text">
            New here? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="login-right">
        <img src={loginIllustration} alt="Career Growth" className="illustration" />
        <div className="intro-text">
          <h2>AI-Powered Career Growth</h2>
          <p>
            Personalized resume analysis, mock interviews, and career insights —
            all in one platform to help you land your dream job.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
