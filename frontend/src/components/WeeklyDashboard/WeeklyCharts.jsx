import React from "react";
import { Bar, Line } from "react-chartjs-2";
import Chart from "chart.js/auto";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const WeeklyCharts = () => {
  return (
    <div className="weekly-charts">
      {/* Main Top Chart - full width */}
      <div className="chart-box main-weekly-chart">
        <h4>Breaks Taken</h4>
        <Line
          data={{
            labels: weekDays,
            datasets: [
              {
                label: "Breaks",
                data: [3, 2, 2, 4, 5, 5, 1],
                borderColor: "#cc0537ff",
                tension: 0.4,
              },
            ],
          }}
          options={{
            scales: { y: { beginAtZero: true } },
            plugins: { legend: { display: false } },
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      </div>

      {/* Bottom Graphs - side by side */}
      <div className="bottom-charts-row">
        <div className="chart-box">
          <h4>Mood Trend</h4>
          <Line
            data={{
              labels: weekDays,
              datasets: [
                {
                  label: "Mood (1-10)",
                  data: [6, 7, 8, 7, 6, 9, 8],
                  borderColor: "#ee5253",
                  tension: 0.4,
                },
              ],
            }}
            options={{
              scales: { y: { min: 1, max: 10 } },
              plugins: { legend: { display: false } },
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>
        <div className="chart-box">
          <h4>Hours Worked</h4>
          <Bar
            data={{
              labels: weekDays,
              datasets: [
                {
                  label: "Hours",
                  backgroundColor: "#d80c46ff",
                  data: [7, 8, 6, 7, 9, 2, 0],
                  borderRadius: 8,
                },
              ],
            }}
            options={{
              scales: { y: { beginAtZero: true, max: 10 } },
              plugins: { legend: { display: false } },
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default WeeklyCharts;
