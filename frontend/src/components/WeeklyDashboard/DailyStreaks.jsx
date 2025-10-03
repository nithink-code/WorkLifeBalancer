import React, { useState } from "react";

const DailyStreaks = () => {
  const [open, setOpen] = useState(false);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const streakData = [false, false, false, false, false, true, true];
  const currentStreak = 1;
  const longestStreak = 1;

  return (
    <div className="daily-streaks-container">
      {/* Header */}
      <div
        className="streaks-header streaks-header-dropdown"
        onClick={() => setOpen((prev) => !prev)}
        style={{ cursor: "pointer", userSelect: "none" }}
      >
        <h2 className="streaks-title">
          Daily Streaks 🔥
        </h2>
        {/* Arrow icon */}
        <span
          className={`dropdown-arrow${open ? " open" : ""}`}
          aria-label={open ? "Collapse" : "Expand"}
        >
          ▼
        </span>
      </div>

      {/* Details, collapsible */}
      {open && (
        <>
          <p className="streaks-subtitle">
            Track your daily activity streaks and stay motivated!
          </p>

          <div className="streak-stats-row">
            <div className="streak-stat">
              <div className="streak-label">
                <span>Current Streak 🔥</span>
              </div>
              <div className="streak-number">{currentStreak} DAYS</div>
            </div>
            <div className="streak-stat">
              <div className="streak-label">
                <span>Longest Streak 🏆</span>
              </div>
              <div className="streak-number">{longestStreak} DAYS</div>
            </div>
          </div>

          <div className="week-calendar">
            {weekDays.map((day, idx) => (
              <div
                key={day}
                className={`calendar-day ${streakData[idx] ? "active" : ""}`}
              >
                <div className="day-name">{day}</div>
                <div className="day-check">{streakData[idx] ? "✓" : ""}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DailyStreaks;
