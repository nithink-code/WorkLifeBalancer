import React from "react";
import WeeklyCharts from "./WeeklyCharts";
import Insights from "./Insights";
import ProfileProgressCard from "./ProfileProgressCard";
import "./Dashboard.css";

const DashboardContainer = () => (
  <div className="dashboard-container">
    <div className="dashboard-main">
       <Insights />
      <WeeklyCharts />
    </div>
    <div className="dashboard-sidebar">
      <ProfileProgressCard
        user={{
          name: "Alex Johnson",
          avatar: "/avatar.png",
          progress: 70,
          balanceScore: 82,
        }}
      />
    </div>
  </div>
);

export default DashboardContainer;