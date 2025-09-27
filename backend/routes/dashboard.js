const express = require("express");
const router = express.Router();
const authenticateToken = require("../models/Auth");
const task = require("../models/Task");
const moodCheckIn = require("../models/moodCheckin");
const session = require("../models/Session");
const breakActivity = require("../models/breakActivity");

// Get weekly dashboard data
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const weekago = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Tasks completed this week
    const taskcompleted = await task.countDocuments({
      userId,
      endTime: { $gte: weekago },
    });

    // Pomodoro sessions this week and average mood/stress
    const sessionWeekly = await session.find({
      userId,
      startTime: { $gte: weekago.getTime() },
    });

    const totalPomodoro = sessionWeekly.length;
    const avgDuration =
      totalPomodoro > 0
        ? Math.round(
            sessionWeekly.reduce((sum, s) => sum + (s.duration || 0), 0) /
              totalPomodoro
          )
        : 0;
    const avgMood =
      totalPomodoro > 0
        ? (
            sessionWeekly.reduce((sum, s) => sum + (s.mood || 0), 0) /
            totalPomodoro
          ).toFixed(2)
        : "N/A";
    const avgStress =
      totalPomodoro > 0
        ? (
            sessionWeekly.reduce((sum, s) => sum + (s.stress || 0), 0) /
            totalPomodoro
          ).toFixed(2)
        : "N/A";

    // Mood check-ins this week
    const moodCheckIns = await moodCheckIn.find({
      userId,
      timestamp: { $gte: weekago },
    });

    const moodStats =
      moodCheckIns.length > 0
        ? {
            averageMood: (
              moodCheckIns.reduce((sum, m) => sum + m.mood, 0) /
              moodCheckIns.length
            ).toFixed(2),
            averageStress: (
              moodCheckIns.reduce((sum, m) => sum + m.stress, 0) /
              moodCheckIns.length
            ).toFixed(2),
          }
        : { averageMood: "N/A", averageStress: "N/A" };

    // Break activities this week
    const breaksWeekly = await breakActivity.countDocuments({
      userId,
      timestamp: { $gte: weekago },
    });
    res.json({
      taskcompleted,
      totalPomodoro,
      avgDuration,
      avgMood,
      avgStress,
      moodStats,
      breaksWeekly,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
