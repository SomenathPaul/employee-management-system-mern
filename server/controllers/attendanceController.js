// server/controllers/attendanceController.js
const Attendance = require("../models/attendance");
const User = require("../models/users");
const { REQUIRED_TIME_MS } = require("../utils/attendanceConfig");

const today = () => new Date().toISOString().slice(0, 10);

/* ================= START WORK ================= */
exports.startWork = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;

    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const existing = await Attendance.findOne({
      userId,
      date: today(),
    });

    if (existing) {
      return res.status(400).json({ message: "Work already started today" });
    }

    const user = await User.findById(userId).select("name employeeId");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const attendance = await Attendance.create({
      userId,
      employeeId: user.employeeId,
      employeeName: user.name,
      date: today(),
      startTime: new Date(),
    });

    res.json({
      message: "Work started",
      startTime: attendance.startTime,
    });
  } catch (err) {
    console.error("Start work error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= MARK ATTENDANCE ================= */
exports.markAttendance = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;

    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const attendance = await Attendance.findOne({
      userId,
      date: today(),
    });

    if (!attendance) {
      return res.status(400).json({ message: "Work not started" });
    }

    if (!attendance.startTime) {
      return res.status(400).json({ message: "Start time missing" });
    }

    if (attendance.status === "PRESENT") {
      return res.status(400).json({ message: "Attendance already marked" });
    }

    const elapsed = Date.now() - new Date(attendance.startTime).getTime();

    if (elapsed < REQUIRED_TIME_MS) {
      return res.status(400).json({
        message: "Required working time not completed",
      });
    }

    const endTime = new Date();
    const totalMs = endTime - attendance.startTime;

    attendance.endTime = endTime;      // ✅ FIX
    attendance.totalMs = totalMs;      // ✅ FIX
    attendance.status = "PRESENT";     // ✅ FIX

    await attendance.save();

    res.json({ message: "Attendance marked successfully" });
  } catch (err) {
    console.error("Mark attendance error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET TODAY ================= */
exports.getTodayAttendance = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;

    const record = await Attendance.findOne({
      userId,
      date: today(),
    });

    res.json(record || null);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET MY ATTENDANCE (ALL DAYS) ================= */
exports.getMyAttendance = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;

    const records = await Attendance.find({ userId })
      .select("date status startTime")
      .sort({ date: 1 }); // oldest → newest

    res.json(records);
  } catch (err) {
    console.error("Get my attendance error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= MANAGER ATTENDANCE SUMMARY ================= */
exports.getManagerAttendanceSummary = async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM
    if (!month) {
      return res.status(400).json({ message: "Month is required" });
    }

    const start = new Date(`${month}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const summary = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: month + "-01",
            $lt: month + "-32", // safe upper bound for month
          },
          status: "PRESENT",
        },
      },
      {
        $group: {
          _id: {
            employeeId: "$employeeId",
            employeeName: "$employeeName",
          },
          present: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          employeeId: "$_id.employeeId",
          name: "$_id.employeeName",
          present: 1,
        },
      },
      { $sort: { present: -1 } },
    ]);

    res.json(summary);
  } catch (err) {
    console.error("Manager attendance summary error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ========== MANAGER: ALL ATTENDANCE (MONTH) ========== */
exports.getAllAttendanceForManager = async (req, res) => {
  try {
    const { month } = req.query;

    const records = await Attendance.find({
      date: { $regex: `^${month}` },
    }).select("employeeId employeeName date status");

    res.json(records);
  } catch (err) {
    console.error("Manager all attendance error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

