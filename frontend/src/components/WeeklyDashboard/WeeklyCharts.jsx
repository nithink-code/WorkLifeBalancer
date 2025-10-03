import React from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  Title,
  Tooltip,
  Legend
);

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const WeeklyCharts = () => {
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

  return (
    <div className="weekly-charts">
      {/* Track Your Progress Section */}
      <div className="track-progress-section">
        <div className="section-header">
          <h3 className="section-title">Track Your Progress</h3>
        </div>
        <p className="section-subtitle">
          Showing Daily New Score for the last 7 days
        </p>

        {/* Main Progress Chart */}
        <div className="main-chart-container">
          <Line
            data={{
              labels: Array.from({ length: 30 }, (_, i) => i + 1),
              datasets: [
                {
                  data: Array.from(
                    { length: 30 },
                    () => Math.floor(Math.random() * 40) + 30
                  ),
                  borderColor: "#10b981",
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  fill: true,
                  tension: 0.4,
                  pointRadius: 0,
                  borderWidth: 2,
                },
              ],
            }}
            options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                x: {
                  ...chartOptions.scales.x,
                  display: false,
                },
              },
            }}
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
            <div className="stat-value">0</div>
          </div>
        </div>
      </div>

      {/* Bottom Charts Row */}
      <div className="bottom-charts-row">
        <div className="chart-box">
          <h4 className="chart-title">Health Progress</h4>
          <div className="chart-wrapper">
            <Bar
              data={{
                labels: weekDays,
                datasets: [
                  {
                    data: [4, 6, 3, 5, 7, 2, 4],
                    backgroundColor: "#3b82f6",
                    borderRadius: 8,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
          <div className="chart-footer">
            <span className="footer-label">Completed</span>
            <span className="footer-value">2/7</span>
          </div>
        </div>

        <div className="chart-box">
          <h4 className="chart-title">Mood Progress</h4>
          <div className="chart-wrapper">
            <Line
              data={{
                labels: weekDays,
                datasets: [
                  {
                    data: [3, 5, 2, 6, 4, 7, 5],
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
            <span className="footer-label">Completed</span>
            <span className="footer-value">1/100</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyCharts;