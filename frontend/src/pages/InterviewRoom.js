import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/InterviewRoom.css";

import {
  FaRobot,
  FaTrophy,
  FaCircle,
  FaMicrophone,
  FaStop,
  FaRedo,
  FaArrowRight,
  FaSignOutAlt
} from "react-icons/fa";

const InterviewRoom = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [interviewId, setInterviewId] = useState(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);

  // ================= INIT =================
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true
        });

        if (isMounted) {
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        }

        const res = await axios.post(
          "http://localhost:5000/api/interview/generate",
          {
            domain: state?.domain || "DSA",
            level: state?.level || "Beginner",
            userId: "12345"
          }
        );

        if (isMounted) {
          setQuestions(res.data.questions);
          setInterviewId(res.data.interviewId);
        }
      } catch (err) {
        if (isMounted)
          setError("Session initialization failed. Check camera/mic permissions.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [state]);

  // ================= SPEAK =================
  const speak = (text) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsAISpeaking(true);
    utterance.onend = () => setIsAISpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // ================= RECORD =================
  const startRecording = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser does not support Speech Recognition");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (e) => {
      let text = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      setTranscript(text);
    };

    recognitionRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsRecording(false);
  };

  // ================= NEXT QUESTION =================
  const handleNext = async () => {
    stopRecording();
    setLoading(true);

    try {
      await axios.post("http://localhost:5000/api/interview/evaluate", {
        interviewId,
        questionIndex: currentIndex,
        userAnswer: transcript || "No answer provided."
      });

      if (currentIndex < questions.length - 1) {
        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);
        setTranscript("");
        speak(questions[nextIdx]);
      } else {
        setIsDone(true);
      }
    } catch (err) {
      setIsDone(true);
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  if (loading && !isStarted) {
    return (
      <div className="loader-screen">
        <div className="spinner"></div>
        <p>Summoning your Interviewer...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <h2>{error}</h2>
        <button onClick={() => navigate(-1)}>Return Home</button>
      </div>
    );
  }

  return (
    <div className="room-container">
      {/* NAV BAR */}
      <nav className="room-nav">
        <div className="nav-left">
          <div className="live-indicator">
            <FaCircle className="live-dot" /> LIVE SESSION
          </div>
          <h2 className="room-title">
            {state?.domain} <small>{state?.level}</small>
          </h2>
        </div>
        <div className="nav-right">
          <button
            className="end-btn"
            onClick={() => navigate(`/report/${interviewId}`)}
          >
            <FaSignOutAlt /> End Interview
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="room-content">
        <section className="visual-section">
          <div className="video-wrapper">
            <video ref={videoRef} autoPlay muted playsInline />
            <div className="video-overlay">User Preview</div>
          </div>

          <div className={`ai-host-card ${isAISpeaking ? "glow-active" : ""}`}>
            <div className="avatar-box">
              <div className="avatar-pulse"></div>
              <FaRobot size={30} />
            </div>
            <div className="ai-info">
              <h4>AI Lead Interviewer</h4>
              <p>
                {isAISpeaking
                  ? "Speaking..."
                  : isRecording
                  ? "Listening..."
                  : "Waiting..."}
              </p>
            </div>
          </div>
        </section>

        {/* INTERACTION CONTROLS */}
        <section className="interaction-section">
          {!isStarted ? (
            <div className="welcome-card">
              <h1>Professional Mock Interview</h1>
              <p>Ensure your camera/mic is ready. AI interviewer is prepared.</p>
              <button
                className="btn-glow-start"
                onClick={() => {
                  setIsStarted(true);
                  speak(questions[0]);
                }}
              >
                Start Interview
              </button>
            </div>
          ) : (
            <div className="interview-flow">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${((currentIndex + 1) / questions.length) * 100}%`
                  }}
                ></div>
              </div>

              <div className="question-box">
                <span className="question-tag">Question {currentIndex + 1}</span>
                <h3 className="question-text">{questions[currentIndex]}</h3>
              </div>

              <div className="transcript-container">
                <label>Real-Time Transcript</label>
                <div className="transcript-display">
                  {transcript || <span className="placeholder">Ready for your input...</span>}
                </div>
              </div>

              {/* ================= BUTTONS ALWAYS VISIBLE ================= */}
              <div className="controls-footer">
                <button className="ctrl-btn repeat" onClick={() => speak(questions[currentIndex])} disabled={isAISpeaking}>
                  <FaRedo /> Repeat Question
                </button>

                {!isRecording ? (
                  <button className="ctrl-btn record-start" onClick={startRecording} disabled={isAISpeaking}>
                    <FaMicrophone /> Answer Now
                  </button>
                ) : (
                  <button className="ctrl-btn record-stop" onClick={stopRecording}>
                    <FaStop /> Stop Recording
                  </button>
                )}

                <button className="ctrl-btn next" onClick={handleNext} disabled={loading || isAISpeaking}>
                  {currentIndex === questions.length - 1 ? "Complete Interview" : <><FaArrowRight /> Next</>}
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* COMPLETION MODAL */}
      {isDone && (
        <div className="final-overlay">
          <div className="final-card">
            <FaTrophy size={50} className="success-icon" />
            <h2>Session Completed Successfully!</h2>
            <p>Your responses have been analyzed. Performance report is ready.</p>
            <button className="view-report-btn" onClick={() => navigate(`/interview-report/${interviewId}`)}>
              Open Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewRoom;
