// server/routes/manager/attendanceRoutes.js
const express = require("express");
const router = express.Router();
const { getAllAttendance, getManagerSummary } = require("../../controllers/manager/attendanceController");
const auth = require("../../middleware/authMiddleware");

router.get("/all", auth, getAllAttendance);
// Make sure this exact path exists
router.get('/summary', auth, getManagerSummary);

module.exports = router;
