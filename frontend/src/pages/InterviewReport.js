import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../styles/InterviewReport.css";

export default function InterviewReport() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) return;

      try {
        const res = await axios.get(`http://localhost:5000/api/report/${id}`);
        if (res.data.success) {
          setReport(res.data.report);
        } else {
          setError(res.data.message || "Failed to load report");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch report");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading) return <div className="loading">Generating report...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="report-container">
      <div className="report-header">
        <h1>AI Interview Report</h1>
        <div className="final-score">{report.overallScore}/10</div>
      </div>

      <div className="top-grid">
        <div className="score-card">
          <div className="score-circle-big">{report.overallScore}</div>
          <p>Overall Score</p>
        </div>

        <div className="circle-metrics">
          <Circle label="Accuracy" value={report.accuracy} />
          <Circle label="Fluency" value={report.fluency} />
          <Circle label="Confidence" value={report.confidence} />
        </div>
      </div>

      <div className="info-grid">
        <Card title="Final Feedback" text={report.finalFeedback} />
        <Card title="Domain" text={report.domain} />
        <Card title="Level" text={report.level} />
      </div>
    </div>
  );
}

function Card({ title, text }) {
  return (
    <div className="info-card">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function Circle({ label, value }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 10) * circumference;

  return (
    <div className="circle-box">
      <svg width="140" height="140">
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke="#1f2937"
          strokeWidth="10"
          fill="none"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke="#3b82f6"
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
        />
      </svg>
      <div className="circle-value">{value}</div>
      <span>{label}</span>
    </div>
  );
}
