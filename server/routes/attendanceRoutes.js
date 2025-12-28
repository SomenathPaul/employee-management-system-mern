const express = require("express");
const router = express.Router();
const Attendance = require("../models/attendance");
const auth = require("../middleware/authMiddleware");

router.get("/today", auth, async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const data = await Attendance.findOne({
    user: req.user.userId,
    date: today,
  });
  res.json(data);
});

router.get("/me", auth, async (req, res) => {
  const data = await Attendance.find({ user: req.user.userId }).sort({ date: -1 });
  res.json(data);
});

module.exports = router;
