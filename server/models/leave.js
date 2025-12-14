// server/models/leave.js
const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true, default: "Employee" },
  leaveType: { type: String, required: true },
  fromDate: { type: String, required: true }, // you used ISO string in DB
  toDate: { type: String, required: true },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: [
      "Pending",   // default new request
      "Verified",  // manager marked verified (pre-approve)
      "Approved",  // approved by manager
      "Rejected",  // rejected by manager
      "Expired",   // optional tag when toDate passed without action
    ],
    default: "Pending",
  },
  appliedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Leave", leaveSchema, "leave_requests");
