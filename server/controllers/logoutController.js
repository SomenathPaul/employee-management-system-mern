const Attendance = require("../models/attendance");
const { REQUIRED_MS } = require("../config/attendanceConfig");

exports.logout = async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date().toISOString().slice(0, 10);

    const attendance = await Attendance.findOne({
      user: userId,
      date: today,
    });

    if (!attendance) {
      return res.json({ success: true, msg: "No attendance found" });
    }

    if (attendance.endTime) {
      return res.json({
        success: true,
        msg: "Already logged out",
        status: attendance.status,
      });
    }

    if (!attendance.startTime) {
      attendance.startTime = attendance.createdAt;
    }

    const endTime = new Date();
    const totalMs = endTime - attendance.startTime;

    attendance.endTime = endTime;
    attendance.totalMs = totalMs;
    attendance.status = totalMs >= REQUIRED_MS ? "PRESENT" : "ABSENT";

    await attendance.save();

    res.json({
      success: true,
      msg: "Logout successful",
      status: attendance.status,
      workedHours: (totalMs / 3600000).toFixed(2),
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ success: false, msg: "Logout failed" });
  }
};
