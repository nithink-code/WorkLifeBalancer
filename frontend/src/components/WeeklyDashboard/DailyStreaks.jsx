import React, { useState } from "react";
import { useWeeklyData } from "../../contexts/WeeklyDataContext";

const DailyStreaks = () => {
  const [open, setOpen] = useState(false);
  const { labels, streakData = [], currentStreak = 0, longestStreak = 0 } = useWeeklyData();

  // labels array from API corresponds to the same index ordering as streakData
  const weekDays = Array.isArray(labels) && labels.length === 7 ? labels : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
            {weekDays.map((day, idx) => {
              const active = Array.isArray(streakData) ? !!streakData[idx] : false;
              return (
                <div key={`${day}-${idx}`} className={`calendar-day ${active ? "active" : ""}`}>
                  <div className="day-name">{day}</div>
                  <div className="day-check">{active ? "✓" : ""}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default DailyStreaks;
