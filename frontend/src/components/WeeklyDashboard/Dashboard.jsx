import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import WeeklyCharts from "./WeeklyCharts";
import ProfileProgressCard from "./ProfileProgressCard";
import DailyStreaks from "./DailyStreaks";
import { useWeeklyData } from "../../contexts/WeeklyDataContext";
import "./Dashboard.css";
import Navbar from "../Navbar";

const DashboardContainer = () => {
  const location = useLocation();
  const { currentStreak, longestStreak } = useWeeklyData();

  useEffect(() => {
    const manualState = location.state?.showToast;
    const params = new URLSearchParams(location.search);
    const oauthToast = params.get("showToast");
    if (manualState || oauthToast === "true") {
      toast.success("Signed up successfully");
      window.history.replaceState({}, document.title, "/dashboard");
    }
  }, [location]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-main">
        <Navbar />
        <DailyStreaks />
        <WeeklyCharts />
      </div>
      <div className="dashboard-sidebar">
        <ProfileProgressCard
          user={{
            avatar:
              "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop",
            progress: 65,
            moodScore: 85,
            maxStreak: longestStreak || 0,
          }}
        />
      </div>
    </div>
  );
};

export default DashboardContainer;