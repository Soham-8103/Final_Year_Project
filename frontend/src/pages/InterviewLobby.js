import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Interview.css";
import Navbar from "../components/Navbar";

const API = "http://localhost:5000"; // your backend URL

const InterviewLobby = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [config, setConfig] = useState({
    domain: "DSA",
    level: "Beginner",
    duration: 3,
  });

  const [stream, setStream] = useState(null);
  const [isCamOn, setIsCamOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dateTime, setDateTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
      setDateTime(formatted);
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (videoRef.current && stream && isCamOn) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isCamOn]);

  const toggleMedia = async (type) => {
    try {
      if (type === "video") {
        if (isCamOn) {
          stream?.getVideoTracks().forEach((t) => t.stop());
          setIsCamOn(false);
        } else {
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: isMicOn,
          });
          setStream(newStream);
          setIsCamOn(true);
        }
      } else if (type === "audio") {
        if (isMicOn) {
          stream?.getAudioTracks().forEach((t) => t.stop());
          setIsMicOn(false);
        } else {
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: isCamOn,
            audio: true,
          });
          setStream(newStream);
          setIsMicOn(true);
        }
      }
      setError("");
    } catch (err) {
      console.error("Media Toggle Error:", err);
      setError("Permissions denied. Please allow camera/mic access.");
    }
  };

  // ================= START INTERVIEW =================
  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/interview/generate`, {
        domain: config.domain,
        level: config.level,
        userId: "testuser", // replace with actual logged-in user
      });

      if (res.data.success) {
        navigate("/interview-room", {
          state: {
            ...config,
            interviewId: res.data.interviewId,
            questions: res.data.questions,
          },
        });
      } else {
        alert("Failed to start interview: " + res.data.message);
      }
    } catch (err) {
      console.error("API Error:", err);
      alert("Failed to start interview. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lobby-wrapper">
      <Navbar />
      <div className="lobby-container">
        <div className="lobby-left">
          <div className="hero-content">
            <div className="hero-datetime">{dateTime}</div>
            <h1>Professional interviews for everyone</h1>
            <p>
              Practice, analyze, and improve your technical skills from anywhere
            </p>
          </div>

          <div className="preview-section">
            <div className="video-box">
              {isCamOn ? (
                <video ref={videoRef} autoPlay muted playsInline />
              ) : (
                <div className="camera-off-msg">
                  <i
                    className="fas fa-user-circle"
                    style={{ fontSize: "5rem", opacity: 0.3 }}
                  ></i>
                  <p>Camera is off</p>
                </div>
              )}
              <div className="meet-controls">
                <button
                  className={`icon-btn ${!isMicOn ? "off" : ""}`}
                  onClick={() => toggleMedia("audio")}
                  title={isMicOn ? "Turn off mic" : "Turn on mic"}
                >
                  <i
                    className={`fas ${
                      isMicOn ? "fa-microphone" : "fa-microphone-slash"
                    }`}
                  ></i>
                </button>
                <button
                  className={`icon-btn ${!isCamOn ? "off" : ""}`}
                  onClick={() => toggleMedia("video")}
                  title={isCamOn ? "Turn off camera" : "Turn on camera"}
                >
                  <i
                    className={`fas ${isCamOn ? "fa-video" : "fa-video-slash"}`}
                  ></i>
                </button>
              </div>
            </div>
            {error && <p className="error-msg">{error}</p>}
          </div>
        </div>

        <div className="lobby-right">
          <div className="setup-card">
            <h2>Ready to join?</h2>
            <div className="form-group">
              <label>Select Domain</label>
              <div className="option-row">
                {["DSA", "DBMS", "Node", "React", "IT Fundamentals"].map(
                  (item) => (
                    <button
                      key={item}
                      className={`option-chip ${
                        config.domain === item ? "active" : ""
                      }`}
                      onClick={() => setConfig({ ...config, domain: item })}
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Difficulty</label>
              <div className="option-row">
                {["Beginner", "Intermediate", "Advanced"].map((level) => (
                  <button
                    key={level}
                    className={`option-chip ${
                      config.level === level ? "active" : ""
                    }`}
                    onClick={() => setConfig({ ...config, level })}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <button className="join-btn" onClick={handleStart} disabled={loading}>
              {loading ? "Summoning your Interviewer..." : "Enter Room"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewLobby;
