const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const authenticateToken = require("../middleware/authenticateJWT");

console.log("Tasks route file loaded");

// Create a new Task
router.post("/", authenticateToken, async (req, res) => {
  console.log("POST /tasks route hit, user:", req.user?.id);
  console.log("Request body:", req.body);
  try {
    const task = new Task({
      userId: req.user.id,
      type: req.body.type,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      isPomodoroEnabled: req.body.isPomodoroEnabled,
    });
    await task.save();
    console.log("Task saved successfully:", task._id);
    res.status(201).json({ message: "Task Added!" });
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(400).json({ message: err.message });
  }
});

// Get all tasks of the logged-in user (general endpoint)
router.get("/", authenticateToken, async (req, res) => {
  console.log("GET /tasks route hit, user:", req.user?.id);
  try {
    const tasks = await Task.find({ userId: req.user.id });
    console.log("Found tasks:", tasks.length);
    res.json(tasks);
  } catch (err) {
    console.error("Error in GET /tasks:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get all tasks of the logged-in user
router.get("/user/:userId", authenticateToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const tasks = await Task.find({ userId: req.params.userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single task by ID (user must own the task)
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a Task by ID (only if owned by user)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedTask) return res.status(404).json({ message: "Task not found" });
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a Task by ID (only if owned by user)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const deletedTask = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deletedTask) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
