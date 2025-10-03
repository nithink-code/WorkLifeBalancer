import React, { useState } from "react";
import { toast } from 'react-toastify';
import Modal from "../Modal";

const API_URL = "http://localhost:8080";

export default function AddBreakForm({ show, onClose }) {
  const [type, setType] = useState("stretch");
  const [feedback, setFeedback] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [duration, setDuration] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const body = {
        type,
        feedback: feedback || undefined,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        duration: duration ? Number(duration) : undefined,
      };

      const res = await fetch(`${API_URL}/break`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP error ${res.status}`);
      }

      onClose();
      toast.success('Break added');
    } catch (err) {
      console.error("AddBreakForm error:", err);
      setError(err.message || "Failed to add break");
      toast.error(err.message || 'Failed to add break');
    }
  };

  return (
    <Modal show={show} onClose={onClose} title="Add Break">
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Break Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="stretch">Stretch</option>
            <option value="walk">Walk</option>
            <option value="snack">Snack</option>
            <option value="meditation">Meditation</option>
            <option value="social">Social</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Timestamp</label>
          <input
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Duration (minutes)</label>
          <input
            type="number"
            min="0"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Optional"
          />
        </div>

        <div className="form-group">
          <label>Feedback</label>
          <input
            type="text"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Optional: how was the break?"
          />
        </div>

        <div className="modal-actions">
          <button type="submit" className="btn primary">Add Break</button>
          <button type="button" onClick={onClose} className="btn">Cancel</button>
        </div>

        {error && <div className="error">{error}</div>}
      </form>
    </Modal>
  );
}
