const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const { body, validationResult } = require("express-validator");
const authenticateToken = require("../middleware/authenticateJWT");

// Validation Middleware
const validateTask = [
  body("type")
    .isIn(["work", "break"])
    .withMessage("Type must be either 'work' or 'break'"),
  body("startTime")
    .isISO8601()
    .toDate()
    .withMessage("Start time must be a valid date"),
  body("endTime")
    .isISO8601()
    .toDate()
    .withMessage("End time must be a valid date"),
  body("isPomodoroEnabled")
    .optional()
    .isBoolean()
    .withMessage("isPomodoroEnabled must be a boolean"),
];

// Function for validation
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

//Create a new Task
router.post(
  "/",
  authenticateToken,
  validateTask,
  validate,
  async (req, res) => {
    try {
      const task = new Task({
        userId: req.user.id,
        type: req.body.type,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        isPomodoroEnabled: req.body.isPomodoroEnabled,
      });
      const savedTask = await task.save();
      res.status(201).json({ message: "Task Added!" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Get all tasks of a user
router.get("/user/userId", async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.params.userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single task from the user Id
router.get("/:id", async (req, res) => {
  try {
    const oneTask = await Task.findById(req.params.id);
    if (!oneTask) return res.status(404).json({ message: "Task not found" });
    res.json(oneTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a Task
router.put("/:id", validateTask, validate, async (req, res) => {
  try {
    const updateTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updateTask) return res.status(404).json({ message: "Task not found" });
    res.json(updateTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a Task
router.delete("/:id", async (req, res) => {
  try {
    const deleteTask = await Task.findByIdAndDelete(req.params.id);
    if (!deleteTask) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
