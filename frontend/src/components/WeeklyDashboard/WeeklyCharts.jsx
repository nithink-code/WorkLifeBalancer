import React from "react";
import { Bar, Line } from "react-chartjs-2";
import { useWeeklyData } from "../../contexts/WeeklyDataContext";

import{
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

const API_URL = "http://localhost:8080";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const WeeklyCharts = () => {
  const { labels, tasksPerDay, breaksPerDay, moodAvgPerDay, moodCountsPerDay, lastOptimistic } = useWeeklyData();
  // Ensure we always pass arrays of length 7 to charts so optimistic updates render
  const safeLabels = Array.isArray(labels) && labels.length === 7 ? labels : weekDays;
  const safeTasks = Array.isArray(tasksPerDay) ? (() => { const a = [...tasksPerDay]; while(a.length < 7) a.push(0); return a.slice(0,7); })() : Array(7).fill(0);
  const safeBreaks = Array.isArray(breaksPerDay) ? (() => { const a = [...breaksPerDay]; while(a.length < 7) a.push(0); return a.slice(0,7); })() : Array(7).fill(0);
  const safeMoodAvg = Array.isArray(moodAvgPerDay) ? (() => { const a = [...moodAvgPerDay]; while(a.length < 7) a.push(null); return a.slice(0,7).map(v => v === null ? null : Number(v)); })() : Array(7).fill(null);
  const safeMoodCounts = Array.isArray(moodCountsPerDay) ? (() => { const a = [...moodCountsPerDay]; while(a.length < 7) a.push(0); return a.slice(0,7); })() : Array(7).fill(0);
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { color: "#9ca3af" },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#9ca3af" },
      },
    },
  };

  // data comes from WeeklyDataContext; it already handles polling and events

  return (
    <div className="weekly-charts">
      {/* Track Your Progress Section */}
      <div className="track-progress-section">
        <div className="section-header">
          <h3 className="section-title">Track Your Task Progress {lastOptimistic && lastOptimistic.type === 'task' && (<span className="optimistic-badge">+1</span>)}</h3>
        </div>
        <p className="section-subtitle">
          Showing Daily New Score for the last 7 days
        </p>

        {/* Main Progress Chart */}
        <div className="main-chart-container">
          <Line
            data={{
              labels: safeLabels,
              datasets: [
                {
                  label: "Tasks Completed",
                  data: safeTasks,
                  borderColor: "#10b981",
                  backgroundColor: "rgba(16, 185, 129, 0.12)",
                  fill: true,
                  tension: 0.4,
                  pointRadius: 0,
                  borderWidth: 2,
                },
              ],
            }}
            options={chartOptions}
          />
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-box">
            <div className="stat-label">Overall Health Score 🔥</div>
            <div className="stat-value">Unranked</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Mood Check-in 🔥</div>
            <div className="stat-value">
              {moodAvgPerDay.length ? moodAvgPerDay.reduce((a,b)=> a+b, 0) / moodAvgPerDay.length : "N/A"}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Charts Row */}
      <div className="bottom-charts-row">
        <div className="chart-box">
          <h4 className="chart-title">Break Progress {lastOptimistic && lastOptimistic.type === 'break' && (<span className="optimistic-badge small">+1</span>)}</h4>
          <div className="chart-wrapper">
            <Bar
              data={{
                labels: safeLabels,
                datasets: [
                  {
                   label: "Breaks",
                   data: safeBreaks,
                   backgroundColor: "#3b82f6",
                   borderRadius: 4,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
          <div className="chart-footer">
            <span className="footer-label">Completed</span>
            <span className="footer-value">{breaksPerDay.reduce((a,b)=> a + b , 0)} / {7}</span>
          </div>
        </div>

        <div className="chart-box">
          <h4 className="chart-title">Mood Progress {lastOptimistic && lastOptimistic.type === 'mood' && (<span className="optimistic-badge small">+1</span>)}</h4>
          <div className="chart-wrapper">
            <Line
              data={{
                labels: safeLabels,
                datasets: [
                  {
                    label: "Average Mood",
                    data: safeMoodAvg,
                    borderColor: "#ec4899",
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: "#ec4899",
                    borderWidth: 2,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
          <div className="chart-footer">
            <span className="footer-label">Average</span>
            <span className="footer-value">
              {moodAvgPerDay.length
                ? (moodAvgPerDay.reduce((a, b) => a + b, 0) / moodAvgPerDay.length).toFixed(2)
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyCharts;