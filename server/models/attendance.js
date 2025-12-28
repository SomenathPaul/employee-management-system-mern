const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    employeeId: String,
    employeeName: String,

    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },

    startTime: Date,
    endTime: Date,

    totalMs: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["PENDING", "PRESENT", "ABSENT"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

// attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema, "attendances");
