// frontend/src/components/MockQuiz.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MockQuiz.css";

const DEFAULT_COUNT = 15;

const domains = [
  "DSA",
  "Web Dev",
  "MySQL",
  "Networking",
  "Aptitude",
  "Combined",
];

const difficulties = ["Easy", "Medium", "Hard"];

export default function MockQuiz() {
  const [stage, setStage] = useState("start"); // start | instructions | setup | quiz | result
  const [domain, setDomain] = useState("DSA");
  const [difficulty, setDifficulty] = useState("Easy");
  const [mode, setMode] = useState("Practice"); // Practice (untimed) | Mock (timed)
  const [count, setCount] = useState(DEFAULT_COUNT);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Quiz runtime state
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({}); // { index: selectedOptionText }
  const [timerSec, setTimerSec] = useState(0); // seconds remaining, used only in Mock mode
  const [resultData, setResultData] = useState(null);
  const [showPreTestModal, setShowPreTestModal] = useState(false);

  // HUD derived
  const answeredCount = Object.keys(answers).length;
  const leftCount = Math.max(0, questions.length - answeredCount);

  // Timer effect for Mock mode
  useEffect(() => {
    if (stage !== "quiz" || mode !== "Mock") return;
    if (timerSec <= 0) {
      // auto-submit when time ends
      handleSubmit();
      return;
    }
    const id = setInterval(() => {
      setTimerSec((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [stage, mode, timerSec]);

  // Fetch questions from backend (single call)
  const fetchQuestions = async () => {
    if (!domain || !difficulty) {
      return alert("Please select domain and difficulty.");
    }
    setLoading(true);
    try {
      const res = await axios.post("/api/mock-quiz/generate-quiz", {
        domain,
        difficulty,
        mode,
        count: Number(count) || DEFAULT_COUNT,
      });

      if (!res.data.success) {
        throw new Error(res.data.error || "AI generation failed");
      }

      const qs = res.data.questions;
      setQuestions(qs);
      setCurrentQ(0);
      setAnswers({});
      setResultData(null);

      // Setup timer only for Mock mode
      if (mode === "Mock") {
        const minutes = 2 * (Number(count) || DEFAULT_COUNT); // 2 minutes per question
        setTimerSec(minutes * 60);
      } else {
        setTimerSec(0);
      }

      // Show instructions modal before loading first question
      setShowPreTestModal(true);
      setStage("instructions");
    } catch (err) {
      console.error(err);
      alert("Failed to fetch questions from AI. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Called when user confirms instructions modal
  const startQuiz = () => {
    setShowPreTestModal(false);
    setStage("quiz");
    // for practice mode timerSec remains 0
  };

  // Selection handler: DO NOT reveal correct/incorrect at this stage
  const handleSelect = (option) => {
    setAnswers((prev) => ({ ...prev, [currentQ]: option }));
  };

  const goNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      handleSubmit();
    }
  };

  // Submit test: calculate score and reveal answers/explanations
  const handleSubmit = () => {
    // Prevent re-submit
    if (stage === "result") return;

    // Calculate score
    let correctCount = 0;
    for (let i = 0; i < questions.length; i++) {
      if (answers[i] && answers[i] === questions[i].correctAnswer) correctCount++;
    }

    const result = {
      total: questions.length,
      correct: correctCount,
      answers,
      questions,
    };
    setResultData(result);
    setStage("result");
  };

  // Quit during quiz
  const handleQuit = async () => {
    try {
      await axios.post("/api/mock-quiz/quit-quiz", { reason: "user_quit" });
    } catch (err) {
      console.warn("quit endpoint failed", err);
    } finally {
      // Show results but mark as aborted (no score calculation or we can calculate)
      let correctCount = 0;
      for (let i = 0; i < questions.length; i++) {
        if (answers[i] && answers[i] === questions[i].correctAnswer) correctCount++;
      }
      setResultData({
        total: questions.length,
        correct: correctCount,
        answers,
        questions,
        aborted: true,
      });
      setStage("result");
    }
  };

  // UI fragments
  if (stage === "start") {
    return (
      <div className="mq-root">
        <div className="mq-card mq-animate-in">
          <h1 className="mq-title">Start Your Test</h1>
          <p className="mq-sub">Choose domain, difficulty, mode and question count.</p>
          <div className="mq-row">
            <label>Domain</label>
            <div className="mq-grid">
              {domains.map((d) => (
                <button
                  key={d}
                  className={`mq-pill ${domain === d ? "active" : ""}`}
                  onClick={() => setDomain(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="mq-row">
            <label>Difficulty</label>
            <div className="mq-grid">
              {difficulties.map((d) => (
                <button
                  key={d}
                  className={`mq-pill ${difficulty === d ? "active" : ""}`}
                  onClick={() => setDifficulty(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="mq-row">
            <label>Mode</label>
            <div className="mq-toggle">
              <button
                className={`toggle-btn ${mode === "Practice" ? "selected" : ""}`}
                onClick={() => setMode("Practice")}
              >
                Practice (Untimed)
              </button>
              <button
                className={`toggle-btn ${mode === "Mock" ? "selected" : ""}`}
                onClick={() => setMode("Mock")}
              >
                Mock (Timed)
              </button>
            </div>
          </div>

          <div className="mq-row">
            <label>Question Count</label>
            <input
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="mq-input"
            />
          </div>

          <div className="mq-actions">
            <button className="mq-start" onClick={() => setStage("setup")}>
              Configure & Continue
            </button>
            <button
              className="mq-ghost"
              onClick={() => {
                setDomain("DSA");
                setDifficulty("Easy");
                setMode("Practice");
                setCount(DEFAULT_COUNT);
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "setup") {
    return (
      <div className="mq-root">
        <div className="mq-card mq-animate-in">
          <h2>Review & Generate</h2>
          <div className="mq-summary">
            <div>Domain: <strong>{domain}</strong></div>
            <div>Difficulty: <strong>{difficulty}</strong></div>
            <div>Mode: <strong>{mode}</strong></div>
            <div>Questions: <strong>{count}</strong></div>
            <div>Time (Mock mode only): <strong>{2 * count} minutes</strong></div>
          </div>

          <div className="mq-actions">
            <button className="mq-start" onClick={fetchQuestions} disabled={loading}>
              {loading ? "Generating Questions..." : "Start Test"}
            </button>
            <button className="mq-ghost" onClick={() => setStage("start")}>Back</button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "instructions" && showPreTestModal && questions.length > 0) {
    // instruction modal with dynamic time
    const totalMinutes = 2 * (Number(count) || DEFAULT_COUNT);
    return (
      <div className="mq-modal">
        <div className="mq-modal-card mq-animate-in">
          <h3>Pre-Test Instructions</h3>
          <ul>
            <li>You must choose one option to answer.</li>
            <li>Click the 'Next' button to advance.</li>
            <li>Each correct question is worth 1 mark.</li>
            {mode === "Mock" ? (
              <li>This test is timed. The total time allowed is <strong>{totalMinutes} minutes</strong>. Submission is automatic upon time running out.</li>
            ) : (
              <li>This test is untimed. You may take as long as you need to practice.</li>
            )}
          </ul>

          <div className="mq-actions">
            <button className="mq-start" onClick={startQuiz}>Begin Test</button>
            <button className="mq-ghost" onClick={() => setStage("setup")}>Change Settings</button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "quiz" && questions.length > 0) {
    const q = questions[currentQ];
    const selected = answers[currentQ] || null;
    const minutes = Math.floor(timerSec / 60);
    const seconds = String(timerSec % 60).padStart(2, "0");

    return (
      <div className="mq-root">
        <div className="mq-card mq-quiz-card mq-animate-in">
          <div className="mq-topbar">
            <div className="mq-hud">
              <div>Done: <strong>{answeredCount}</strong></div>
              <div>Left: <strong>{leftCount}</strong></div>
            </div>

            {mode === "Mock" && (
              <div className="mq-timer" aria-live="polite">
                {minutes}:{seconds}
              </div>
            )}
          </div>

          <div className="mq-question-area">
            <h3 className="mq-qtitle">Q{currentQ + 1}. {q.question}</h3>

            <ul className="mq-options">
              {q.options.map((opt, idx) => {
                const isSelected = selected === opt;
                return (
                  <li
                    key={idx}
                    className={`mq-option ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelect(opt)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSelect(opt); }}
                  >
                    <span className="mq-opt-letter">{["A","B","C","D"][idx]}</span>
                    <span className="mq-opt-text">{opt}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mq-controls">
            <button
              className="mq-quit"
              onClick={() => {
                if (window.confirm("Are you sure you want to quit the quiz? Your progress will be submitted.")) {
                  handleQuit();
                }
              }}
            >
              Quit
            </button>

            <div className="mq-nav-right">
              <div className="mq-progress">
                {currentQ + 1}/{questions.length}
              </div>
              <button
                className={`mq-next ${!selected ? "disabled" : ""}`}
                onClick={goNext}
                disabled={!selected}
              >
                {currentQ === questions.length - 1 ? "Submit Test" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "result" && resultData) {
    const { total, correct, answers: ansMap = {}, questions: qs = [], aborted } = resultData;
    return (
      <div className="mq-root">
        <div className="mq-card mq-result-card mq-animate-in">
          <h2>Test Completed {aborted ? " (Aborted)" : "✅"}</h2>
          <p className="mq-score">Your Score: <strong>{correct}</strong> / {total}</p>

          <div className="mq-result-list">
            {qs.map((q, i) => {
              const userAnswer = ansMap[i] || "<No Answer>";
              const isCorrect = userAnswer === q.correctAnswer;
              return (
                <div className="mq-result-item" key={i}>
                  <div className="mq-r-q"><strong>Q{i+1}:</strong> {q.question}</div>
                  <div className="mq-r-user"><strong>Your answer:</strong> {userAnswer}</div>
                  <div className="mq-r-correct"><strong>Correct answer:</strong> {q.correctAnswer}</div>
                  <div className="mq-r-expl"><strong>Explanation:</strong> {q.explanation}</div>
                </div>
              );
            })}
          </div>

          <div className="mq-actions">
            <button className="mq-start" onClick={() => {
              // reset to setup allowing user to take another
              setStage("setup");
              setQuestions([]);
              setAnswers({});
              setResultData(null);
            }}>
              Take Another Test
            </button>

            <button className="mq-ghost" onClick={() => {
              // back to home start
              setStage("start");
              setQuestions([]);
              setAnswers({});
              setResultData(null);
            }}>
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
