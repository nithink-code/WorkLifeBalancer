const express = require("express");
const router = express.Router();
const Session = require("../models/Session");
const { body, validationResult } = require("express-validator");
const authenticateToken = require("../middleware/authenticateJWT");

// Validation Middleware
const validatePomodoro = [
  body("workType").isString().notEmpty().withMessage("Work type is required"),
  body("taskId").isMongoId().withMessage("Valid Task ID is required"),
];

// Stop Validation Middleware
const validateStop = [
  body("moodRating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Mood rating must be between 1 and 5"),
  body("stressLevel")
    .isInt({ min: 1, max: 5 })
    .withMessage("Stress level must be between 1 and 5"),
];

// Validation Function
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// Start Time of Pomodoro Session
router.post(
  "/start",
  authenticateToken,
  validatePomodoro,
  validate,
  async (req, res) => {
    try {
      const { taskId, workType } = req.body;
      const session = new Session({
        userId: req.user.id,
        taskId,
        workType,
        startTime: Date.now(),
        endTime: null,
      });

      const savedSession = await session.save();
      res.status(201).json(savedSession);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Pause a Session
router.put("/pause/:id", authenticateToken, async (req, res) => {
  try {
    const now = Date.now();
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!session) res.status(404).json({ message: "Not Found" });
    session.pauseResumeLog.push({ pauseTime: now });
    await session.save();
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Resume a session
router.put("/resume/:id", authenticateToken, async (req, res) => {
  try {
    const now = Date.now();
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!session) res.status(404).json({ message: "Not Found" });
    const log = session.pauseResumeLog[session.pauseResumeLog.length - 1];
    if (log && !log.resumeTime) log.resumeTime = now;
    await session.save();
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Stop session - Along with the calculation of mood and stress level
router.put(
  "/stop/:id",
  authenticateToken,
  validateStop,
  validate,
  async (req, res) => {
    try {
      const now = Date.now();
      const { moodRating, stressLevel } = req.body;
      const session = await Session.findOne({
        _id: req.params.id,
        userId: req.user.id,
      });
      session.endTime = now;
      if (!session) res.status(404).json({ message: "Not Found" });
      let pauseDuration = 0;
      session.pauseResumeLog.forEach((log) => {
        if (log.pauseTime && log.resumeTime) {
          pauseDuration += log.resumeTime - log.pauseTime;
        }
      });
      session.duration = now - session.startTime - pauseDuration;
      session.moodRating = moodRating;
      session.stressLevel = stressLevel;
      await session.save();
      res.json(session);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
