import React from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";

const Navbar = ({ showUserName = false, userName }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarLeft}>
        <Link to="/dashboard" className={styles.navbarBrand}>
          SensAI
        </Link>
      </div>

      <div className={styles.navbarRight}>
        {showUserName && (
          <>
            <span className={styles.navbarUsername}>Hello, {userName}</span>
            <div className={styles.userIcon}>{getInitials(userName)}</div>
          </>
        )}
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
