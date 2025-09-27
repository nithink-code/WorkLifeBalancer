const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const moodCheckin = require("../models/moodCheckin");
const authenticateToken = require("../middleware/authenticateJWT");
const MoodCheckin = require("../models/moodCheckin");

// Validation Middleware
const validateMoodCheckin = [
  body("mood")
    .isInt({ min: 1, max: 5 })
    .withMessage("Mood must be an integer between 1 and 5"),
  body("stress")
    .isInt({ min: 1, max: 5 })
    .withMessage("Stress must be an integer between 1 and 5"),
  body("timestamp")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Timestamp must be a valid date"),
];

// Validate Function
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Create a mood Check-in
router.post(
  "/",
  authenticateToken,
  validateMoodCheckin,
  validate,
  async (req, res) => {
    try {
      const { mood, stress, timestamp } = req.body;
      const checkin = new moodCheckin({
        userId: req.user.id,
        mood,
        stress,
        timestamp: timestamp ? new Date(timestamp) : Date.now(),
      });

      const savedCheckin = await checkin.save();
      res.status(201).json(savedCheckin);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Get all mood Check-ins for a logged in user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const query = { userId: req.user.id };
    if (req.query.startDate || req.query.endDate) {
      query.timestamp = {};
      // To get the date after startDate and before endDate
      if (req.query.startDate)
        query.timestamp.$gte = new Date(req.query.startDate);
      if (req.query.endDate) query.timestamp.$lte = new Date(req.query.endDate);
    }
    // To sort in descending order of timestamp so that latest check-ins come first
    const checkins = await moodCheckin.find(query).sort({ timestamp: -1 });
    res.json(checkins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single mood check in by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const checkin = await MoodCheckin.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!checkin)
      return res.status(404).json({ message: "Check-in not found" });
    res.json(checkin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a mood check-in by ID
router.put(
  "/:id",
  authenticateToken,
  validateMoodCheckin,
  validate,
  async (req, res) => {
    try {
      const updates = req.body;
      const updatedcheckin = await MoodCheckin.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        updates,
        { new: true }
      );
      if (!updatedcheckin)
        return res.status(404).json({ message: "check in not found" });
      res.json(updatedcheckin);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Delete a mood check in by ID
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const deletedcheckin = await MoodCheckin.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!deletedcheckin)
      return res.status(404).json({ message: "Check-in not found" });
    res.json({ message: "Check-in deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
