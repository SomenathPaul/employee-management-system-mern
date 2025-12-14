// server/routes/attendanceRoutes.js
const express = require("express");
const router = express.Router();
const { markAttendance, getAttendance } = require("../controllers/attendanceController"); // ✅ fix name
const authMiddleware = require("../middleware/authMiddleware");

// route to mark attendance
router.post("/mark", authMiddleware, markAttendance);
// route for get attendance data
router.get("/get", authMiddleware, getAttendance); 

module.exports = router;
