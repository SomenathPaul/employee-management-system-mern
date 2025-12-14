// server/models/attendance.js
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String },
  status: { type: String, enum: ["Present", "Absent"], default: "Absent" },
  date: { 
    type: String,
    required: true,
    default: () => new Date().toISOString().split("T")[0], // auto YYYY-MM-DD
  },
  remarks: { type: String, default: "" },
});

module.exports = mongoose.model("Attendance", attendanceSchema, "attendance");
