import React from "react";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const ProfileProgressCard = ({ user }) => {
  const handleDownloadReport = () => {
    console.log("Downloading report...");
  };

  return (
    <div className="profile-progress-card">
      {/* Circular Progress with Avatar */}
      <div className="circular-progress-wrapper">
        <CircularProgressbarWithChildren
          value={user.progress}
          strokeWidth={7}
          styles={buildStyles({
            pathColor: "#34B27B",
            trailColor: "#2a2a2a",
            strokeLinecap: "round",
          })}
        >
          <div className="avatar-container">
            <img src="/avatar.png" alt="User Avatar" className="avatar-image" />
            <div className="progress-badge">{user.progress}%</div>
          </div>
        </CircularProgressbarWithChildren>
      </div>

      {/* Stats Boxes */}
      <div className="sidebar-stats">
        <div className="sidebar-stat-box">
          <div className="sidebar-stat-label">Mood Check-in</div>
          <div className="sidebar-stat-value">{user.moodScore}/100</div>
        </div>
        <div className="sidebar-stat-box">
          <div className="sidebar-stat-label">Max Streak</div>
          <div className="sidebar-stat-value">{user.maxStreak} Days</div>
        </div>
      </div>

      {/* Download Report Button */}
      <button className="download-report-btn" onClick={handleDownloadReport}>
        📥 Download Report
      </button>
    </div>
  );
};

export default ProfileProgressCard;