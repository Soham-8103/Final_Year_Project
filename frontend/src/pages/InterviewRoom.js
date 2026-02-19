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

const API = "http://localhost:5000/api/interview";

const InterviewRoom = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState(state?.questions || []);
  const [interviewId] = useState(state?.interviewId || null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize camera + microphone
  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        alert("Camera and microphone access required");
      }
    };

    initMedia();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Speak text using speech synthesis
  const speak = (text) => {
    if (!text) return;

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.onstart = () => setIsAISpeaking(true);
    utter.onend = () => setIsAISpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  // Start recording user answer
  const startRecording = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };

    recognitionRef.current.start();
    setIsRecording(true);
  };

  // Stop recording
  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  // Handle next question / finish interview
  const handleNext = async () => {
    stopRecording();
    setLoading(true);

    try {
      await axios.post(`${API}/evaluate`, {
        interviewId,
        questionIndex: currentIndex,
        userAnswer: transcript || "No answer"
      });

      if (currentIndex < questions.length - 1) {
        const next = currentIndex + 1;
        setCurrentIndex(next);
        setTranscript("");
        speak(questions[next]);
      } else {
        // Mark interview as done and navigate to report
        setIsDone(true);

        // Give a short delay to show "Interview Completed" overlay
        setTimeout(() => {
          navigate(`/interview-report/${interviewId}`);
        }, 1500);
      }
    } catch (err) {
      console.error("Evaluation failed:", err);
      alert("Something went wrong while saving your answer. Navigating to report...");
      navigate(`/interview-report/${interviewId}`);
    }

    setLoading(false);
  };

  if (!questions.length) {
    return (
      <div className="loader-screen">
        <div className="spinner"></div>
        <p>Preparing your interview...</p>
      </div>
    );
  }

  return (
    <div className="room-container">
      <nav className="room-nav">
        <div className="nav-left">
          <div className="live-indicator">
            <FaCircle className="live-dot" /> LIVE SESSION
          </div>
          <h2>
            {state?.domain || "Unknown Domain"} <small>{state?.level || ""}</small>
          </h2>
        </div>

        <button
          className="end-btn"
          onClick={() => navigate(`/interview-report/${interviewId}`)}
        >
          <FaSignOutAlt /> End
        </button>
      </nav>

      <main className="room-content">
        <section className="visual-section">
          <div className="video-wrapper">
            <video ref={videoRef} autoPlay muted playsInline />
            <div className="video-overlay">You</div>
          </div>

          <div className={`ai-host-card ${isAISpeaking ? "glow-active" : ""}`}>
            <FaRobot size={28} />
            <p>
              {isAISpeaking
                ? "AI speaking..."
                : isRecording
                ? "Listening..."
                : "Waiting"}
            </p>
          </div>
        </section>

        <section className="interaction-section">
          {!isStarted ? (
            <div className="welcome-card">
              <h1>AI Mock Interview</h1>
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
              <div className="question-box">
                <span>Question {currentIndex + 1}</span>
                <h3>{questions[currentIndex]}</h3>
              </div>

              <div className="transcript-display">
                {transcript || "Speak your answer..."}
              </div>

              <div className="controls-footer">
                <button onClick={() => speak(questions[currentIndex])}>
                  <FaRedo /> Repeat
                </button>

                {!isRecording ? (
                  <button onClick={startRecording}>
                    <FaMicrophone /> Answer
                  </button>
                ) : (
                  <button onClick={stopRecording}>
                    <FaStop /> Stop
                  </button>
                )}

                <button onClick={handleNext} disabled={loading}>
                  {currentIndex === questions.length - 1
                    ? "Finish"
                    : (
                      <>
                        <FaArrowRight /> Next
                      </>
                    )}
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {isDone && (
        <div className="final-overlay">
          <div className="final-card">
            <FaTrophy size={50} />
            <h2>Interview Completed</h2>
            <button onClick={() => navigate(`/interview-report/${interviewId}`)}>
              View Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewRoom;
