import React, { useState } from "react";
import { toast } from 'react-toastify';
import { useWeeklyData } from '../../../contexts/WeeklyDataContext';
import Modal from "../Modal";

const API_URL = "http://localhost:8080";

export default function AddMoodCheckinForm({ show, onClose }) {
  const useCtx = useWeeklyData();
  const [mood, setMood] = useState(3);
  const [stress, setStress] = useState(3);
  const [timestamp, setTimestamp] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_URL}/mood`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          mood,
          stress,
          timestamp: timestamp ? new Date(timestamp) : undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to add mood check-in");
  onClose();
  toast.success('Mood check-in added');
  try{ useCtx.refresh && useCtx.refresh(); }catch(e){}
  console.log('MoodForm: called ctx.refresh');
  try{ useCtx.optimisticAddMood && useCtx.optimisticAddMood(mood, new Date(timestamp || Date.now())); }catch(e){}
  try{ window.dispatchEvent(new Event('weeklyDataUpdated')); }catch(e){}
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to add mood check-in');
    }
  };

  return (
    <Modal show={show} onClose={onClose} title="Add Mood Check-In">
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Mood (1=Bad, 5=Great)</label>
          <input
            type="number"
            min={1}
            max={5}
            value={mood}
            onChange={e => setMood(Number(e.target.value))}
            required
          />
        </div>
        <div className="form-group">
          <label>Stress (1=Low, 5=High)</label>
          <input
            type="number"
            min={1}
            max={5}
            value={stress}
            onChange={e => setStress(Number(e.target.value))}
            required
          />
        </div>
        <div className="form-group">
          <label>Timestamp</label>
          <input
            type="datetime-local"
            value={timestamp}
            onChange={e => setTimestamp(e.target.value)}
          />
        </div>
        <div className="modal-actions">
          <button type="submit" className="btn primary">Add</button>
          <button type="button" onClick={onClose} className="btn">Cancel</button>
        </div>
        {error && <div className="error">{error}</div>}
      </form>
    </Modal>
  );
}
