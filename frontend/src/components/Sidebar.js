import React from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaFileAlt, FaMicrophone, FaBriefcase, FaGraduationCap } from "react-icons/fa";
import "./../styles/dashboard.css";

/*
  Slim left sidebar which mirrors LinkedIn: icon + label.
  Collapsible behavior can be added later; for now it's always visible on wide screens.
*/
const Sidebar = () => {
  const activeClass = ({ isActive }) => isActive ? "ac-sb-link active" : "ac-sb-link";
  return (
    <aside className="ac-sidebar">
      <nav className="ac-sb-nav">
        <NavLink to="/" className={activeClass}>
          <FaHome className="ac-sb-icon" />
          <span>Home</span>
        </NavLink>
        <NavLink to="/resume-analyzer" className={activeClass}>
          <FaFileAlt className="ac-sb-icon" />
          <span>Resume Score</span>
        </NavLink>
        <NavLink to="/mock-interview" className={activeClass}>
          <FaMicrophone className="ac-sb-icon" />
          <span>Mock Interview</span>
        </NavLink>
        <NavLink to="/job-insights" className={activeClass}>
          <FaBriefcase className="ac-sb-icon" />
          <span>Job Insights</span>
        </NavLink>
        <NavLink to="/ai-quiz" className={activeClass}>
          <FaGraduationCap className="ac-sb-icon" />
          <span>AI Quiz</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
