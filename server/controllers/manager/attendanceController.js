// server/controllers/manager/attendanceController.js
const Attendance = require("../../models/attendance");
const User = require("../../models/users");

exports.getAllAttendance = async (req, res) => {
  try {
    // 🔐 Manager-only access
    if (req.user.role.toUpperCase() !== "MANAGER") {
      return res.status(403).json({
        success: false,
        msg: "Access denied",
      });
    }

    const { date, status, employeeId } = req.query;

    // 🧠 Dynamic filter
    let filter = {};
    if (date) filter.date = date;
    if (status) filter.status = status;
    if (employeeId) filter.employeeId = employeeId;

    const attendance = await Attendance.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (err) {
    console.error("Get attendance error:", err);
    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
};

exports.getManagerSummary = async (req, res) => {
  try {
    // 🔐 Security Guard
    if (req.user.role.toUpperCase() !== "MANAGER") {
      return res.status(403).json({ success: false, msg: "Access denied" });
    }

    const { month } = req.query; 
    if (!month) return res.status(400).json({ msg: "Month parameter is required" });
    
    const summary = await Attendance.aggregate([
      { 
        $match: { 
          date: { $regex: `^${month}` },
          status: "PRESENT"
        } 
      },
      {
        $group: {
          _id: "$employeeId",
          present: { $sum: 1 },
          employeeId: { $first: "$employeeId" },
          employeeName: { $first: "$employeeName" }
        }
      }
    ]);

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error });
  }
};
