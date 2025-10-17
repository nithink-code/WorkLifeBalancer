import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const API_URL = "http://localhost:8080";

const WeeklyDataContext = createContext(null);

export const WeeklyDataProvider = ({ children }) => {
  const [labels, setLabels] = useState([]);
  const [tasksPerDay, setTasksPerDay] = useState([]);
  const [breaksPerDay, setBreaksPerDay] = useState([]);
  const [moodAvgPerDay, setMoodAvgPerDay] = useState([]);
  const [moodCountsPerDay, setMoodCountsPerDay] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [streakData, setStreakData] = useState([]);
  const [lastOptimistic, setLastOptimistic] = useState(null);

  // helper to compute dayKey used by backend (YYYY-MM-DD)
  const dayKey = (d) => {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    return dt.toISOString().slice(0, 10);
  };

  const computeStreaksFromArray = (arr) => {
    let cur = 0;
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i]) cur++;
      else break;
    }
    let longest = 0;
    let run = 0;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i]) {
        run++;
        longest = Math.max(longest, run);
      } else run = 0;
    }
    return { current: cur, longest };
  };

  const fetchWeeklyData = useCallback(async () => {
    try {
      const headers = {};
      const token = localStorage.getItem("token");
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/dashboard/weekly-data`, {
        method: "GET",
        credentials: "include",
        headers,
      });
      if (!res.ok) {
        // ignore silently
        return;
      }
      const json = await res.json();
      setLabels(json.labels || []);
      setTasksPerDay(json.tasksPerDay || []);
      setBreaksPerDay(json.breaksPerDay || []);
      // ensure numbers or nulls
      setMoodAvgPerDay((json.moodAvgPerDay || []).map((m) => (m === null ? null : Number(m))));
      setCurrentStreak(typeof json.currentStreak === "number" ? json.currentStreak : 0);
      setLongestStreak(typeof json.longestStreak === "number" ? json.longestStreak : 0);
      setStreakData(Array.isArray(json.streakData) ? json.streakData : []);
      // additionally fetch raw items to compute accurate per-day counts (especially for mood counts)
      try {
        const [tasksRes, breaksRes, moodsRes] = await Promise.all([
          fetch(`${API_URL}/tasks`, { credentials: 'include', headers }),
          fetch(`${API_URL}/break`, { credentials: 'include', headers }),
          fetch(`${API_URL}/mood`, { credentials: 'include', headers }),
        ]);
        if (tasksRes.ok && breaksRes.ok && moodsRes.ok) {
          const [tasksList, breaksList, moodsList] = await Promise.all([tasksRes.json(), breaksRes.json(), moodsRes.json()]);
          // compute counts for last 7 days
          const today = new Date();
          today.setHours(0,0,0,0);
          const start = new Date(today);
          start.setDate(start.getDate()-6);

          const makeEmpty = () => { const a = []; for(let i=0;i<7;i++) a.push(0); return a; };
          const tCounts = makeEmpty();
          const bCounts = makeEmpty();
          const mCounts = makeEmpty();

          const indexForDateLocal = (date) => {
            if (!date) return -1;
            const dt = new Date(date);
            dt.setHours(0,0,0,0);
            const key = dt.toISOString().slice(0,10);
            for (let i = 0; i < 7; i++) {
              const d = new Date(start);
              d.setDate(start.getDate() + i);
              if (d.toISOString().slice(0,10) === key) return i;
            }
            return -1;
          };

          tasksList.forEach(t => {
            const idx = indexForDateLocal(t.endTime || t.updatedAt || t.createdAt);
            if (idx >= 0) tCounts[idx]++;
          });
          breaksList.forEach(b => {
            const idx = indexForDateLocal(b.timestamp || b.timeStamp || b.createdAt);
            if (idx >= 0) bCounts[idx]++;
          });
          moodsList.forEach(m => {
            const idx = indexForDateLocal(m.timestamp || m.timeStamp || m.createdAt);
            if (idx >= 0) mCounts[idx]++;
          });

          // if server-provided series differ, prefer the computed counts for accuracy
          setTasksPerDay(tCounts);
          setBreaksPerDay(bCounts);
          setMoodCountsPerDay(mCounts);
          // also mark streakData for days with any activity
          const sData = Array.from({length:7},(_,i)=> (tCounts[i] + bCounts[i] + (mCounts[i] || 0)) > 0 );
          setStreakData(sData);
          const s = computeStreaksFromArray(sData);
          setCurrentStreak(s.current);
          setLongestStreak(s.longest);
        }
      } catch(e) {
        // non-fatal
        console.warn('Failed to fetch raw lists for counts', e);
      }
    } catch (err) {
      console.error("WeeklyDataContext: failed to fetch weekly data", err);
    }
  }, []);

  // optimistic helpers: update local arrays quickly while refresh() syncs with server
  const optimisticAddTask = (date) => {
    try {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - 6);
      const key = dayKey(date || new Date());
      let idx = -1;
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        if (dayKey(d) === key) {
          idx = i;
          break;
        }
      }
      if (idx < 0) return;
      setTasksPerDay((prev) => {
        const arr = prev ? [...prev] : Array(7).fill(0);
        while (arr.length < 7) arr.push(0);
        arr[idx] = (arr[idx] || 0) + 1;
        return arr;
      });
      setStreakData((prev) => {
        const arr = prev ? [...prev] : Array(7).fill(false);
        while (arr.length < 7) arr.push(false);
        arr[idx] = true;
        const s = computeStreaksFromArray(arr);
        setCurrentStreak(s.current);
        setLongestStreak(s.longest);
        // notify UI for a short animation
        try { setLastOptimistic({ type: 'task', idx, ts: Date.now() }); setTimeout(()=> setLastOptimistic(null), 1200); } catch(e){}
        return arr;
      });
    } catch (e) {
      console.error('optimisticAddTask error', e);
    }
  };

  const optimisticAddBreak = (date) => {
    try {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - 6);
      const key = dayKey(date || new Date());
      let idx = -1;
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        if (dayKey(d) === key) {
          idx = i;
          break;
        }
      }
      if (idx < 0) return;
      setBreaksPerDay((prev) => {
        const arr = prev ? [...prev] : Array(7).fill(0);
        while (arr.length < 7) arr.push(0);
        arr[idx] = (arr[idx] || 0) + 1;
        return arr;
      });
      setStreakData((prev) => {
        const arr = prev ? [...prev] : Array(7).fill(false);
        while (arr.length < 7) arr.push(false);
        arr[idx] = true;
        const s = computeStreaksFromArray(arr);
        setCurrentStreak(s.current);
        setLongestStreak(s.longest);
        try { setLastOptimistic({ type: 'break', idx, ts: Date.now() }); setTimeout(()=> setLastOptimistic(null), 1200); } catch(e){}
        return arr;
      });
    } catch (e) {
      console.error('optimisticAddBreak error', e);
    }
  };

  const optimisticAddMood = (moodValue, date) => {
    try {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - 6);
      const key = dayKey(date || new Date());
      let idx = -1;
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        if (dayKey(d) === key) {
          idx = i;
          break;
        }
      }
      if (idx < 0) return;
      setMoodAvgPerDay((prev) => {
        const arr = prev ? [...prev] : Array(7).fill(null);
        while (arr.length < 7) arr.push(null);
        const existing = arr[idx];
        if (existing === null || existing === undefined) arr[idx] = moodValue;
        else arr[idx] = (Number(existing) + Number(moodValue)) / 2;
        return arr;
      });
      setStreakData((prev) => {
        const arr = prev ? [...prev] : Array(7).fill(false);
        while (arr.length < 7) arr.push(false);
        arr[idx] = true;
        const s = computeStreaksFromArray(arr);
        setCurrentStreak(s.current);
        setLongestStreak(s.longest);
        try { setLastOptimistic({ type: 'mood', idx, ts: Date.now() }); setTimeout(()=> setLastOptimistic(null), 1200); } catch(e){}
        return arr;
      });
    } catch (e) {
      console.error('optimisticAddMood error', e);
    }
  };

  useEffect(() => {
    fetchWeeklyData();

    // faster polling during development so updates appear quickly
    const POLL_INTERVAL_MS = 10 * 1000; // 10s
    const id = setInterval(fetchWeeklyData, POLL_INTERVAL_MS);

    const handler = () => fetchWeeklyData();
    window.addEventListener("weeklyDataUpdated", handler);

    // expose a manual refresh helper for debugging (call from console)
    try {
      window.refreshWeeklyData = fetchWeeklyData;
    } catch (e) {}

    return () => {
      clearInterval(id);
      window.removeEventListener("weeklyDataUpdated", handler);
      try {
        if (window.refreshWeeklyData === fetchWeeklyData) delete window.refreshWeeklyData;
      } catch (e) {}
    };
  }, [fetchWeeklyData]);

  return (
    <WeeklyDataContext.Provider
      value={{
        labels,
        tasksPerDay,
        breaksPerDay,
        moodAvgPerDay,
        currentStreak,
        longestStreak,
        streakData,
  refresh: fetchWeeklyData,
  optimisticAddTask,
  optimisticAddBreak,
  optimisticAddMood,
  moodCountsPerDay,
  lastOptimistic,
      }}
    >
      {children}
    </WeeklyDataContext.Provider>
  );
};

export const useWeeklyData = () => {
  const ctx = useContext(WeeklyDataContext);
  if (!ctx) throw new Error("useWeeklyData must be used within WeeklyDataProvider");
  return ctx;
};

export default WeeklyDataContext;
