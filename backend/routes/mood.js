const express = require("express");
const router = express.Router();
const MoodCheckin = require("../models/moodCheckin");
const authenticateToken = require("../middleware/authenticateJWT");

// Create a mood check-in
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { mood, stress, timestamp } = req.body;
    const checkin = new MoodCheckin({
      userId: req.user.id,
      mood,
      stress,
      timestamp: timestamp ? new Date(timestamp) : Date.now(),
    });

    const savedCheckin = await checkin.save();
    res.status(201).json(savedCheckin);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all mood check-ins for logged in user with optional date filter
router.get("/", authenticateToken, async (req, res) => {
  try {
    const query = { userId: req.user.id };

    if (req.query.startDate || req.query.endDate) {
      query.timestamp = {};
      if (req.query.startDate) query.timestamp.$gte = new Date(req.query.startDate);
      if (req.query.endDate) query.timestamp.$lte = new Date(req.query.endDate);
    }

    const checkins = await MoodCheckin.find(query).sort({ timestamp: -1 });
    res.json(checkins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single mood check-in by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const checkin = await MoodCheckin.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!checkin) {
      return res.status(404).json({ message: "Check-in not found" });
    }
    res.json(checkin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a mood check-in by ID
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    const updatedCheckin = await MoodCheckin.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    );
    if (!updatedCheckin) {
      return res.status(404).json({ message: "Check-in not found" });
    }
    res.json(updatedCheckin);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a mood check-in by ID
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const deletedCheckin = await MoodCheckin.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!deletedCheckin) {
      return res.status(404).json({ message: "Check-in not found" });
    }
    res.json({ message: "Check-in deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;