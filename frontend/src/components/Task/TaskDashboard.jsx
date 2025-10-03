import React, { useState, useEffect } from "react";
import AddTaskForm from "../Task/Forms/TaskForm";
import AddMoodCheckinForm from "../Task/Forms/MoodForm";
import AddBreakForm from "../Task/Forms/BreakForm";
import "./TaskDashboard.css";
import { toast } from 'react-toastify';
import Navbar from '../Navbar';

const API_URL = "http://localhost:8080";

export default function TaskDashboard() {
  const [tasks, setTasks] = useState([]);
  const [moodCheckins, setMoodCheckins] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showMoodForm, setShowMoodForm] = useState(false);
  const [showBreakForm, setShowBreakForm] = useState(false);

  const userId = localStorage.getItem("userId");
  const authToken = localStorage.getItem("token");

  console.log("TaskDashboard - Auth State:", {
    hasToken: !!authToken,
    hasUserId: !!userId,
    tokenLength: authToken ? authToken.length : 0,
  });

  useEffect(() => {
    const verifyAuthentication = async () => {
      console.log("verifyAuthentication - checking authToken:", !!authToken);
      if (!authToken) {
        try {
          console.log("No authToken, trying cookie verification...");
          const res = await fetch(`${API_URL}/auth/verify`, {
            credentials: "include",
          });

          console.log("Auth verify response status:", res.status);

          if (res.ok) {
            const data = await res.json();
            console.log("Auth verify response data:", data);
            if (data.registered && data.user && data.token) {
              localStorage.setItem("token", data.token);
              localStorage.setItem("userId", data.user.id);
              localStorage.setItem("userEmail", data.user.email);
              localStorage.setItem("userName", data.user.name);
              console.log(
                "Authentication verified via cookie and token stored"
              );
              return true;
            }
          } else {
            console.log("Auth verify failed with status:", res.status);
            const errorText = await res.text();
            console.log("Auth verify error:", errorText);
          }
        } catch (error) {
          console.error("Failed to verify authentication:", error);
        }
      }
      return !!authToken;
    };

    const initializeData = async () => {
      const isAuthenticated = await verifyAuthentication();

      if (isAuthenticated) {
        fetchTasks();
        fetchMoodCheckins();
      } else {
        console.warn("Missing authentication token. Please log in.");
      }
    };

    initializeData();
  }, [authToken]);

  const fetchTasks = async () => {
    try {
      console.log("Making request to:", `${API_URL}/tasks`);
      const res = await fetch(`${API_URL}/tasks`, {
        credentials: "include",
      });

      console.log("Response status:", res.status);
      console.log(
        "Response headers:",
        Object.fromEntries(res.headers.entries())
      );

      if (res.status === 403) {
        console.error("Access forbidden. Please login again.");
        return;
      }

      if (res.status === 401) {
        console.error("Unauthorized. Please login again.");
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }

      const data = await res.json();
      console.log("Tasks data received:", data);
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const fetchMoodCheckins = async () => {
    try {
      const res = await fetch(`${API_URL}/mood`, {
        credentials: "include",
      });

      if (res.status === 403) {
        console.error("Access forbidden. Please login again.");
        return;
      }

      if (res.status === 401) {
        console.error("Unauthorized. Please login again.");
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }

      const data = await res.json();
      setMoodCheckins(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch mood checkins:", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      fetchTasks();
      toast.success('Task deleted');
    } catch (err) {
      console.error("Error deleting task:", err);
      toast.error(err.message || 'Failed to delete task');
    }
  };

  const handleDeleteMood = async (moodId) => {
    try {
      const currentToken = localStorage.getItem("token");
      if (!currentToken) {
        console.error("No authentication token found");
        return;
      }

      const res = await fetch(`${API_URL}/mood/${moodId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${currentToken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      fetchMoodCheckins();
      toast.success('Mood check-in deleted');
    } catch (err) {
      console.error("Error deleting mood check-in:", err);
      toast.error(err.message || 'Failed to delete mood check-in');
    }
  };

  return (
    <>
    <Navbar />
    <div className="dashboard-container1">
      <div className="container py-5">
        {/* Welcome Header */}
        <div className="welcome-section text-center mb-5">
          <div className="fire-icon-wrapper mb-3">
            <span className="fire-icon">🔥</span>
          </div>
          <h1 className="welcome-title mb-2">Welcome to Your Task Dashboard</h1>
          <p className="welcome-subtitle">
            Add your tasks and mood check-ins to stay productive and mindful
          </p>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons-section mb-5">
          <div className="row g-3 action-buttons-row">
            <div className="action-col">
              <button
                className="btn btn-primary btn-lg action-btn"
                onClick={() => setShowTaskForm(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  className="bi bi-plus-circle me-2"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                </svg>
                Add Task
              </button>
            </div>
            <div className="action-col">
              <button
                className="btn btn-info btn-lg action-btn"
                onClick={() => setShowBreakForm(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-clock-history me-2" viewBox="0 0 16 16">
                  <path d="M8.515 3.019A5.5 5.5 0 1 0 13.5 8a.5.5 0 0 0 1 0A6.5 6.5 0 1 1 8 1.5a.5.5 0 0 0 .515 1.519z"/>
                  <path d="M7.5 4a.5.5 0 0 1 .5.5V8h2a.5.5 0 0 1 0 1H8a.5.5 0 0 1-.5-.5V4.5A.5.5 0 0 1 7.5 4z"/>
                </svg>
                Add Break
              </button>
            </div>
            <div className="action-col mood-col">
              <button
                className="btn btn-success btn-lg action-btn mood-btn"
                onClick={() => setShowMoodForm(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  className="bi bi-emoji-smile me-2"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                  <path d="M4.285 9.567a.5.5 0 0 1 .683.183A3.498 3.498 0 0 0 8 11.5a3.498 3.498 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.498 4.498 0 0 1 8 12.5a4.498 4.498 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683zM7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zm4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5z" />
                </svg>
                Add Mood Check-In
              </button>
            </div>
          </div>
        </div>

        {/* Modals */}
        <AddTaskForm
          show={showTaskForm}
          onClose={() => {
            setShowTaskForm(false);
            fetchTasks();
          }}
        />
        <AddMoodCheckinForm
          show={showMoodForm}
          onClose={() => {
            setShowMoodForm(false);
            fetchMoodCheckins();
          }}
        />
          <AddBreakForm
            show={showBreakForm}
            onClose={() => {
              setShowBreakForm(false);
              // refresh tasks/mood if desired; break listing isn't on this page yet
              fetchTasks();
              fetchMoodCheckins();
            }}
          />

        {/* Tasks Section */}
        <div className="content-section mb-5">
          <div className="section-header d-flex justify-content-between align-items-center mb-4">
            <h3 className="section-title">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                className="bi bi-list-task me-2"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M2 2.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5V3a.5.5 0 0 0-.5-.5H2zM3 3H2v1h1V3z"
                />
                <path d="M5 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM5.5 7a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1h-9zm0 4a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1h-9z" />
                <path
                  fillRule="evenodd"
                  d="M1.5 7a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5V7zM2 7h1v1H2V7zm0 3.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5H2zm1 .5H2v1h1v-1z"
                />
              </svg>
              Recently Added Tasks
            </h3>
            <span className="badge bg-primary rounded-pill">
              {tasks.length}
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="empty-state text-center py-5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                fill="currentColor"
                className="bi bi-inbox mb-3 text"
                viewBox="0 0 16 16"
              >
                <path d="M4.98 4a.5.5 0 0 0-.39.188L1.54 8H6a.5.5 0 0 1 .5.5 1.5 1.5 0 1 0 3 0A.5.5 0 0 1 10 8h4.46l-3.05-3.812A.5.5 0 0 0 11.02 4H4.98zm9.954 5H10.45a2.5 2.5 0 0 1-4.9 0H1.066l.32 2.562a.5.5 0 0 0 .497.438h12.234a.5.5 0 0 0 .496-.438L14.933 9zM3.809 3.563A1.5 1.5 0 0 1 4.981 3h6.038a1.5 1.5 0 0 1 1.172.563l3.7 4.625a.5.5 0 0 1 .105.374l-.39 3.124A1.5 1.5 0 0 1 14.117 13H1.883a1.5 1.5 0 0 1-1.489-1.314l-.39-3.124a.5.5 0 0 1 .106-.374l3.7-4.625z" />
              </svg>
              <p className="text mb-0 " style={{color: '#718096'}}>
                No tasks found. Start by adding your first task!
              </p>
            </div>
          ) : (
            <div className="tasks-grid">
              {tasks.map((task) => (
                <div key={task._id} className="card task-card mb-3">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="task-type-badge">
                        <span className="badge bg-info">{task.type}</span>
                      </div>
                      <button
                        className="btn btn-sm btn-outline-danger delete-btn"
                        onClick={() => handleDeleteTask(task._id)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-trash"
                          viewBox="0 0 16 16"
                        >
                          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                          <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
                        </svg>
                      </button>
                    </div>

                    <div className="task-details">
                      <div className="detail-row mb-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-calendar-event me-2 text-muted"
                          viewBox="0 0 16 16"
                        >
                          <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z" />
                          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
                        </svg>
                        <strong>Start:</strong>{" "}
                        {new Date(task.startTime).toLocaleString()}
                      </div>
                      <div className="detail-row mb-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-calendar-check me-2 text-muted"
                          viewBox="0 0 16 16"
                        >
                          <path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z" />
                          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
                        </svg>
                        <strong>End:</strong>{" "}
                        {new Date(task.endTime).toLocaleString()}
                      </div>
                      <div className="detail-row">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-hourglass-split me-2 text-muted"
                          viewBox="0 0 16 16"
                        >
                          <path d="M2.5 15a.5.5 0 1 1 0-1h1v-1a4.5 4.5 0 0 1 2.557-4.06c.29-.139.443-.377.443-.59v-.7c0-.213-.154-.451-.443-.59A4.5 4.5 0 0 1 3.5 3V2h-1a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-1v1a4.5 4.5 0 0 1-2.557 4.06c-.29.139-.443.377-.443.59v.7c0 .213.154.451.443.59A4.5 4.5 0 0 1 12.5 13v1h1a.5.5 0 0 1 0 1h-11zm2-13v1c0 .537.12 1.045.337 1.5h6.326c.216-.455.337-.963.337-1.5V2h-7zm3 6.35c0 .701-.478 1.236-1.011 1.492A3.5 3.5 0 0 0 4.5 13s.866-1.299 3-1.48V8.35zm1 0v3.17c2.134.181 3 1.48 3 1.48a3.5 3.5 0 0 0-1.989-3.158C8.978 9.586 8.5 9.052 8.5 8.351z" />
                        </svg>
                        <span
                          className={
                            task.isPomodoroEnabled
                              ? "badge bg-warning text-dark"
                              : "badge bg-secondary"
                          }
                        >
                          Pomodoro:{" "}
                          {task.isPomodoroEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>

                    {/* Mood Check-ins for this task */}
                    {moodCheckins
                      .filter(
                        (m) =>
                          m.timestamp >= task.startTime &&
                          m.timestamp <= task.endTime
                      )
                      .map((m) => (
                        <div key={m._id} className="mood-checkin-inline mt-3">
                          <div className="d-flex justify-content-between align-items-center p-3">
                            <div>
                              <span className="badge bg-success me-2">
                                Mood: {m.mood}
                              </span>
                              <span className="badge bg-warning text-dark">
                                Stress: {m.stress}
                              </span>
                            </div>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteMood(m._id)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                fill="currentColor"
                                className="bi bi-trash"
                                viewBox="0 0 16 16"
                              >
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
