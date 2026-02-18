import React, { useRef, useState, useMemo } from "react";
import axios from "axios";
import "./ResumeAnalyzer.css";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import {
  FaFileUpload,
  FaSpinner,
  FaChevronDown,
  FaCopy,
} from "react-icons/fa";

const ResumeAnalyzer = () => {
  // -------------------- State --------------------
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [collapsedSections, setCollapsedSections] = useState({});

  // -------------------- Handlers --------------------
  const handleFileClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      alert("Please upload a resume first.");
      return;
    }

    setLoading(true);
    setAnalysis(null);

    const formData = new FormData();
    formData.append("resume", selectedFile);
    formData.append("jobRole", jobRole || "General");

    try {
      const res = await axios.post("http://localhost:5000/api/resume/analyze", formData);
      setAnalysis(res.data.analysis);
    } catch (err) {
      console.error("Resume analysis failed:", err.response?.data || err.message);
      alert("Resume analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard");
  };

  // -------------------- Helpers --------------------
  const getScoreColor = (score) => {
    if (score >= 80) return "#28a745";
    if (score >= 50) return "#ffc107";
    return "#dc3545";
  };

  const categories = useMemo(
    () => [
      { title: "Format & Structure", value: analysis?.formatStructure },
      { title: "Content Quality", value: analysis?.contentQuality },
      { title: "Keyword Optimization", value: analysis?.keywordsOptimization },
      { title: "Experience Presentation", value: analysis?.experiencePresentation },
      { title: "Skills Assessment", value: analysis?.skillsAssessment },
    ],
    [analysis]
  );

  const renderListSection = (title, items, allowCopy = false) => {
    if (!items?.length) return null;
    const isCollapsed = collapsedSections[title];

    return (
      <div className="analysis-card">
        <div className="card-header" onClick={() => toggleSection(title)}>
          <h4>{title}</h4>
          <FaChevronDown className={`chevron-icon ${isCollapsed ? "rotated" : ""}`} />
        </div>

        {!isCollapsed && (
          <ul>
            {items.map((item, index) => (
              <li key={index}>
                {item}
                {allowCopy && (
                  <FaCopy className="copy-icon" onClick={() => copyToClipboard(item)} />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  // -------------------- UI --------------------
  return (
    <div className="resume-analyzer-container">
      {/* Left Pane */}
      <div className="left-pane">
        <h1>Resume Analyzer</h1>
        <p className="subtitle">Get AI-powered feedback to improve your resume</p>

        <div className="upload-section">
          <h2>Upload Resume</h2>
          <p>PDF, DOC, or DOCX supported</p>
          <div className="upload-box" onClick={handleFileClick}>
            <FaFileUpload size={42} color="#007bff" />
            <p className="upload-link">Click to upload</p>
            {selectedFile && <p className="selected-file">{selectedFile.name}</p>}
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="target-job-section">
          <h2>Target Job Role (Optional)</h2>
          <input
            type="text"
            placeholder="e.g. Frontend Developer"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
          />
        </div>

        <button className="analyze-btn" onClick={handleAnalyze} disabled={loading}>
          {loading ? (
            <>
              <FaSpinner className="spin-icon" /> Analyzing...
            </>
          ) : (
            "Analyze Resume"
          )}
        </button>
      </div>

      {/* Right Pane */}
      <div className="right-pane">
        <h2>Analysis Dashboard</h2>

        {loading && (
          <div className="loading-section">
            <FaSpinner className="big-spin-icon" />
            <p>Analyzing your resume...</p>
          </div>
        )}

        {!loading && analysis && (
          <div className="analysis-results">
            <div className="radial-charts">
              {categories.map(
                (cat, index) =>
                  typeof cat.value === "number" && (
                    <div key={index} className="radial-chart-card">
                      <CircularProgressbar
                        value={cat.value}
                        text={`${cat.value}`}
                        styles={buildStyles({
                          pathColor: getScoreColor(cat.value),
                          textColor: "#e0e0e0",
                          trailColor: "#44455c",
                        })}
                      />
                      <p>{cat.title}</p>
                    </div>
                  )
              )}
            </div>

            {renderListSection("Strengths", analysis.strengths)}
            {renderListSection("Weaknesses", analysis.weaknesses)}
            {renderListSection("Formatting Tips", analysis.formattingTips)}
            {renderListSection("Actionable Suggestions", analysis.actionableSuggestions, true)}
            {renderListSection("Keyword Suggestions", analysis.keywordSuggestions, true)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
