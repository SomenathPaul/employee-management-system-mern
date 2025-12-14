// server/controllers/attendanceController.js
const Attendance = require("../models/attendance");

exports.markAttendance = async (req, res) => {
  try {
    const { employeeId, name, role } = req.body;
    const today = new Date().toISOString().split("T")[0];
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Prevent double marking
    const existing = await Attendance.findOne({ employeeId, date: today });
    if (existing) {
      return res.status(400).json({ msg: "Attendance already marked for today." });
    }

    let remarks = "On-Time";
    let status = "Present";

    // If after 11:00 AM → late
    if (hour > 11 || (hour === 11 && minute > 0)) {
      const lateMinutes = (hour - 10) * 60 + minute;
      remarks = `Late by ${lateMinutes} minutes`;
    }

    const newAttendance = new Attendance({
      employeeId,
      name,
      role,
      status,
      date: today,
      remarks,
    });

    await newAttendance.save();
    res.status(201).json({ msg: "Attendance marked successfully", newAttendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find();
    if (!attendance || attendance.length === 0) {
      return res.status(404).json({ msg: "No attendance records found" });
    }
    res.status(200).json(attendance);
  } catch (err) {
    console.error("Error fetching attendance:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
