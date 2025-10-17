const express = require("express");
const router = express.Router();
const authenticateToken = require("../models/Auth");
const task = require("../models/Task");
const moodCheckIn = require("../models/moodCheckin");
const session = require("../models/Session");
const breakActivity = require("../models/breakActivity");
const MoodCheckin = require("../models/moodCheckin");

// Helper to format day 

function dayKey(d){
  const dt = new Date(d);
  dt.setHours(0,0,0,0);
  return dt.toISOString().slice(0,10); // YYYY-MM-DD
}

router.get('/weekly-data',authenticateToken,async(req,res)=>{
  try{
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0,0,0,0);
    const start = new Date(today);
    start.setDate(start.getDate()-6); // last 7 days including today

    const[tasks,breaks,moods] = await Promise.all([
      task.find({userId,endTime: {$gte: start}}).lean(),
      breakActivity.find({userId,timestamp: {$gte: start}}).lean(),
      MoodCheckin.find({
        userId,
        $or:[
          {timestamp: {$gte: start}},
          {timestamp: {$gte: start}},
          {createdAt: {$gte: start}},
        ],
      }).lean(),
    ]);

    // Prepare last 7 days labels
    const labels = [];
    const tasksPerDay = [];
    const breaksPerDay = [];
    const moodAvgPerDay = [];
    const moodCounts = [];

    for(let i=0;i<7;i++){
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      labels.push(d.toLocaleDateString(undefined, { weekday: "short" })); // Mon, Tue...
      tasksPerDay.push(0);
      breaksPerDay.push(0);
      moodAvgPerDay.push(0);
      moodCounts.push(0);
    }

    const indexForDate = (date) =>{
      if (!date) return -1;
      const key = dayKey(date);
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        if (dayKey(d) === key) return i;
      }
      return -1;
    };

    // Accumulate tasks
    tasks.forEach((t)=>{
      const idx = indexForDate(t.endTime || t.updatedAt || t.createdAt);
      if(idx >= 0) tasksPerDay[idx]++;
    });
    
    // Accumulate Breaks
    breaks.forEach((b)=>{
      const idx = indexForDate(b.timestamp || b.timeStamp || b.createdAt);
      if(idx >= 0) breaksPerDay[idx]++;
    });

    // Accumulate Moods
    moods.forEach((m)=>{
      const idx = indexForDate(m.timestamp || m.timeStamp || m.createdAt);
      if(idx >= 0 && typeof m.mood === "number") {
        moodAvgPerDay[idx] += m.mood;
        moodCounts[idx]++;
      }
    });

    for(let i=0;i<7;i++){
      moodAvgPerDay[i] = moodCounts[i] > 0 ? (moodAvgPerDay[i]/moodCounts[i]).toFixed(2) : null;
    }

    // Build Streak Data
    const streakData = labels.map((_,i)=>{
      return(tasksPerDay[i] + breaksPerDay[i] + moodAvgPerDay[i] ) > 0;
    });

    // Compute current and longest streak
    let currentStreak = 0;
    for(let i=6;i>=0;i--){
      if(streakData[i]) currentStreak++;
      else break;
  }
  
    // Compute longest streak
    let longestStreak = 0;
    let running = 0;
    for(let i=0;i<7;i++){
      if(streakData[i]){
        running++;
        longestStreak = Math.max(longestStreak,running);
      }else{
        running = 0;
      }
    }

    res.json({
      labels,
      tasksPerDay,
      breaksPerDay,
      moodAvgPerDay,
      currentStreak,
      longestStreak,
      streakData,
    });
}catch(err){
  console.error("Error in weekly data",err);
  res.status(500).json({message: "Server Error"});
}
});






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
