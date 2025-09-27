import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const ProfileProgressCard = ({ user }) => (
  <div className="profile-progress-card">
    <CircularProgressbarWithChildren
      value={user.progress}
      strokeWidth={7}
      styles={buildStyles({
        pathColor: "#2ecc40",
        trailColor: "#fffbfbff",
        strokeLinecap: "round",
      })}
    >
      <div style={{ position: "relative", width: 178, height: 290 }}>
        {/* Avatar image */}
        <img
          src={user.avatar}
          alt="User Avatar"
          style={{
            width: 178,
            height: 290,
            borderRadius: "50%",
            marginBottom: 6,
            paddingBottom: 52,
          }}
        />
        {/* Progress Percentage Overlay */}
        <div
          style={{
            position: "absolute",
            left: "54%",
            bottom: "85px",
            transform: "translateX(-50%)",
            color: "#47df42",
            fontWeight: "bold",
            fontSize: "1.3rem",
            padding: "2px 12px",
            borderRadius: "18px",
          }}
        >
          {user.progress}%
        </div>
      </div>
    </CircularProgressbarWithChildren>

    {/* Health & Mood Stats Boxes */}
    <div className="progress-stats-row">
      <div className="small-stat-box health-score">
        <div className="stat-label">Overall Health Score</div>
        <div className="stat-number">{user.progress}/100</div>
      </div>
      <div className="small-stat-box mood-score">
        <div className="stat-label">Mood Check-in</div>
        <div className="stat-number">{user.moodScore}/100</div>
      </div>
    </div>
  </div>
);

export default ProfileProgressCard;
