import React from 'react';
import { useWeeklyData } from '../../contexts/WeeklyDataContext';

const DebugWeeklyData = () => {
  const { labels, tasksPerDay, breaksPerDay, moodAvgPerDay, streakData, currentStreak, longestStreak, refresh } = useWeeklyData();

  return (
    <div style={{
      background: '#0b0b0b',
      color: '#d1d5db',
      border: '1px solid #374151',
      borderRadius: 8,
      padding: 12,
      marginTop: 12,
      fontSize: 12,
      maxHeight: 220,
      overflow: 'auto'
    }}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
        <strong>Weekly Data Debug</strong>
        <button onClick={() => { try{ refresh && refresh(); }catch(e){} }} style={{background:'#111827', color:'#d1d5db', border:'1px solid #374151', borderRadius:6, padding:'4px 8px'}}>Refresh</button>
      </div>
      <div><strong>labels:</strong> {JSON.stringify(labels)}</div>
      <div><strong>tasksPerDay:</strong> {JSON.stringify(tasksPerDay)}</div>
      <div><strong>breaksPerDay:</strong> {JSON.stringify(breaksPerDay)}</div>
      <div><strong>moodAvgPerDay:</strong> {JSON.stringify(moodAvgPerDay)}</div>
      <div><strong>streakData:</strong> {JSON.stringify(streakData)}</div>
      <div style={{marginTop:6}}><strong>currentStreak:</strong> {String(currentStreak)} &nbsp; <strong>longestStreak:</strong> {String(longestStreak)}</div>
    </div>
  );
};

export default DebugWeeklyData;
