import React, { useState } from "react";
import { toast } from 'react-toastify';
import { useWeeklyData } from '../../../contexts/WeeklyDataContext';
import Modal from "../Modal";

const API_URL = "http://localhost:8080";

export default function AddTaskForm({ show, onClose }) {
  const useCtx = useWeeklyData();
  const [type, setType] = useState("work");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isPomodoroEnabled, setIsPomodoroEnabled] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          isPomodoroEnabled,
        }),
      });
      if (!res.ok) throw new Error("Failed to add task");
  toast.success("Task added");

  onClose();
  // Refresh context so charts/streaks update immediately
  try{ useCtx.refresh && useCtx.refresh(); }catch(e){}
  console.log('TaskForm: called ctx.refresh');
  try{ useCtx.optimisticAddTask && useCtx.optimisticAddTask(new Date(startTime)); }catch(e){}
  // fallback: Notify charts to refresh (older components)
  try{ window.dispatchEvent(new Event('weeklyDataUpdated')); }catch(e){}
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to add task');
    }
  };

  return (
    <Modal show={show} onClose={onClose} title="Add Task">
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Type</label>
          <select value={type} onChange={e => setType(e.target.value)}>
            <option value="work">Work</option>
            <option value="break">Break</option>
          </select>
        </div>
        <div className="form-group">
          <label>Start Time</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>End Time</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={isPomodoroEnabled}
              onChange={e => setIsPomodoroEnabled(e.target.checked)}
            />&nbsp;
            Enable Pomodoro?
          </label>
        </div>

        {/* Task-specific form only (break fields removed) */}
        <div className="modal-actions">
          <button type="submit" className="btn primary">Add</button>
          <button type="button" onClick={onClose} className="btn">Cancel</button>
        </div>
        {error && <div className="error">{error}</div>}
      </form>
    </Modal>
  );
}
