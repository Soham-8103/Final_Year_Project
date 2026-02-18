import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

import {
  FaChartArea,
  FaArrowLeft,
  FaFilePdf,
  FaLightbulb,
} from "react-icons/fa";

import "../styles/InterviewReport.css";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);
const API = "http://localhost:5000";

const InterviewReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================= FETCH REPORT =================
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`${API}/api/interview/report/${id}`);
        setReport(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load report");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  // ================= STATES =================
  if (loading) {
    return (
      <div className="report-loading">
        <h1>Analyzing your performance...</h1>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="report-error">
        <h2>Report not found</h2>
        <button onClick={() => navigate("/")}>Go Back</button>
      </div>
    );
  }

  // ================= METRICS =================
  const totalQ = report.questions?.length || 1;

  const avgAccuracy = (
    report.questions.reduce((s, q) => s + (q.feedback?.accuracy || 0), 0) /
    totalQ
  ).toFixed(1);

  const avgConfidence = (
    report.questions.reduce((s, q) => s + (q.feedback?.confidence || 0), 0) /
    totalQ
  ).toFixed(1);

  const avgFluency = (
    report.questions.reduce((s, q) => s + (q.feedback?.fluency || 0), 0) /
    totalQ
  ).toFixed(1);

  // ================= CHART =================
  const chartData = {
    labels: ["Accuracy", "Confidence", "Fluency"],
    datasets: [
      {
        label: "Score",
        data: [avgAccuracy, avgConfidence, avgFluency],
        backgroundColor: "rgba(59,130,246,0.25)",
        borderColor: "#3b82f6",
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    scales: {
      r: {
        suggestedMin: 0,
        suggestedMax: 10,
        ticks: { display: false },
      },
    },
    plugins: { legend: { display: false } },
  };

  // ================= UI =================
  return (
    <div className="report-dashboard">
      {/* HEADER */}
      <header className="report-header">
        <div>
          <h1>Interview Analysis</h1>
          <p>
            {report.domain} • {report.level} Level
          </p>
        </div>

        <div className="overall-badge">
          <span className="score-num">{report.overallScore || 0}</span>
          <span className="score-label">OVERALL</span>
        </div>
      </header>

      {/* SUMMARY */}
      <section className="summary-card">
        <h3>AI Summary</h3>
        <p>{report.summary || "Good performance overall."}</p>
      </section>

      {/* GRID */}
      <main className="report-grid">
        {/* CHART */}
        <section className="viz-card">
          <h3>
            <FaChartArea /> Competency
          </h3>

          <Radar data={chartData} options={chartOptions} />

          <div className="metric-pills">
            <div>Accuracy: {avgAccuracy}</div>
            <div>Confidence: {avgConfidence}</div>
            <div>Fluency: {avgFluency}</div>
          </div>
        </section>

        {/* FEEDBACK */}
        <section className="feedback-scroll">
          <h3>Detailed Feedback</h3>

          {report.questions.map((q, i) => (
            <div key={i} className="q-feedback-card">
              <div className="q-header">
                <span>Q{i + 1}</span>
                <h4>{q.question}</h4>
              </div>

              <p className="user-answer">{q.userAnswer}</p>

              <div className="ai-comments">
                <b>AI Review:</b>
                <p>{q.feedback?.comments}</p>
              </div>

              <div className="tips-box">
                <FaLightbulb />
                <p>{q.feedback?.improvementTips}</p>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* STRENGTHS */}
      <section className="strengths-box">
        <h3>Strengths</h3>
        <ul>
          {report.strengths?.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>

        <h3>Improvements</h3>
        <ul>
          {report.improvements?.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </section>

      {/* FOOTER */}
      <footer className="report-footer">
        <button className="btn-back" onClick={() => navigate("/")}>
          <FaArrowLeft /> Back
        </button>

        <button className="btn-print" onClick={() => window.print()}>
          <FaFilePdf /> Download PDF
        </button>
      </footer>
    </div>
  );
};

export default InterviewReport;
