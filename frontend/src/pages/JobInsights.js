import React, { useState, useMemo } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import "./JobInsights.css";

const COLORS = ["#4f46e5", "#06b6d4", "#f59e0b", "#ef4444", "#10b981"];

const JobInsights = () => {
  const [search, setSearch] = useState({ role: "", loc: "" });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!search.role) return alert("Please enter a job title");
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/jobs/search?query=${search.role}&location=${search.loc}`
      );
      setJobs(res.data.jobs || []);
    } catch (err) {
      alert("Failed to fetch jobs");
    }
    setLoading(false);
  };

  /* ------------------ ANALYTICS ------------------ */
  const analytics = useMemo(() => {
    if (!jobs.length) return null;

    // Top companies
    const companyMap = {};
    jobs.forEach(j => {
      companyMap[j.company] = (companyMap[j.company] || 0) + 1;
    });

    const topCompanies = Object.entries(companyMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Work type
    const workType = { Remote: 0, Hybrid: 0, Onsite: 0 };
    jobs.forEach(j => {
      const loc = j.location.toLowerCase();
      if (loc.includes("remote")) workType.Remote++;
      else if (loc.includes("hybrid")) workType.Hybrid++;
      else workType.Onsite++;
    });

    const workTypeData = Object.entries(workType).map(([name, value]) => ({
      name,
      value
    }));

    // Freshness
    const freshness = { "Last 24h": 0, "Last 3 days": 0, Older: 0 };
    jobs.forEach(j => {
      const d = j.date.toLowerCase();
      if (d.includes("today") || d.includes("1 day")) freshness["Last 24h"]++;
      else if (d.includes("2") || d.includes("3")) freshness["Last 3 days"]++;
      else freshness.Older++;
    });

    const freshnessData = Object.entries(freshness).map(([name, count]) => ({
      name,
      count
    }));

    // Skill demand
    const skills = ["react", "node", "python", "java", "aws", "docker"];
    const skillMap = {};
    jobs.forEach(j => {
      const text = `${j.title} ${j.company}`.toLowerCase();
      skills.forEach(s => {
        if (text.includes(s)) skillMap[s] = (skillMap[s] || 0) + 1;
      });
    });

    const skillData = Object.entries(skillMap).map(([name, count]) => ({
      name: name.toUpperCase(),
      count
    }));

    return { topCompanies, workTypeData, freshnessData, skillData };
  }, [jobs]);

  /* ------------------ INSIGHTS ------------------ */
  const insights = useMemo(() => {
    if (!analytics) return [];

    const list = [];

    if (jobs.length > 30)
      list.push("Strong hiring momentum in the current market.");
    else if (jobs.length < 10)
      list.push("Limited openings — niche or competitive role.");

    const remoteCount =
      analytics.workTypeData.find(i => i.name === "Remote")?.value || 0;

    const remotePct = Math.round((remoteCount / jobs.length) * 100);

    list.push(
      remotePct > 40
        ? `Remote-friendly role (${remotePct}% remote jobs).`
        : "Mostly on-site opportunities."
    );

    if (analytics.topCompanies[0]?.count >= 4)
      list.push(
        `${analytics.topCompanies[0].name} is hiring aggressively.`
      );

    if (analytics.skillData.length)
      list.push(
        `High-demand skill: ${analytics.skillData.sort(
          (a, b) => b.count - a.count
        )[0].name}`
      );

    return list;
  }, [analytics, jobs]);

  /* ------------------ UI ------------------ */
  return (
    <div className="job-insights-container">
      <h1>Job Market Insights</h1>

      {/* Search */}
      <div className="search-bar">
        <input
          placeholder="Job title"
          onChange={e => setSearch({ ...search, role: e.target.value })}
        />
        <input
          placeholder="Location"
          onChange={e => setSearch({ ...search, loc: e.target.value })}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? "Analyzing..." : "Compare Jobs"}
        </button>
      </div>

      {/* ================= TABLE FIRST ================= */}
      <div className="table-container">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Location</th>
              <th>Source</th>
              <th>Posted</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length ? (
              jobs.map((job, i) => (
                <tr key={i}>
                  <td><strong>{job.company}</strong></td>
                  <td>{job.title}</td>
                  <td>{job.location}</td>
                  <td><span className="source-badge">{job.website}</span></td>
                  <td>{job.date}</td>
                  <td>
                    <a
                      href={job.link}
                      target="_blank"
                      rel="noreferrer"
                      className="apply-link"
                    >
                      View Role
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: 40 }}>
                  {loading
                    ? "Fetching latest jobs..."
                    : "Search to view job listings"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= INSIGHTS ================= */}
      {insights.length > 0 && (
        <div className="ai-insights">
          <h3>Market Insights</h3>
          <ul>
            {insights.map((i, idx) => (
              <li key={idx}>{i}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ================= VISUALS ================= */}
      {analytics && (
        <div className="charts-container">
          <div className="chart-wrapper">
            <h4>Work Type Distribution</h4>
            <ResponsiveContainer height={250}>
              <PieChart>
                <Pie data={analytics.workTypeData} dataKey="value">
                  {analytics.workTypeData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-wrapper">
            <h4>Top Hiring Companies</h4>
            <ResponsiveContainer height={250}>
              <BarChart data={analytics.topCompanies}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-wrapper">
            <h4>Skill Demand</h4>
            <ResponsiveContainer height={250}>
              <BarChart data={analytics.skillData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-wrapper">
            <h4>Job Freshness</h4>
            <ResponsiveContainer height={250}>
              <BarChart data={analytics.freshnessData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobInsights;