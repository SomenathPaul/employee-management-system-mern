const mongoose = require("mongoose");
const User = require("../../models/users");
const Attendance = require("../../models/attendance");
const Leave = require("../../models/leave");
const Task = require("../../models/task");

exports.getEmployeeFullAnalytics = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // 1️⃣ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    const empId = new mongoose.Types.ObjectId(employeeId);

    // 2️⃣ Employee
    const user = await User.findById(empId).select(
      "name employeeId email"
    );
    if (!user) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // 3️⃣ Attendance
    const attendance = await Attendance.find({
      employeeId: empId,
    });

    // 4️⃣ Leaves (support BOTH ObjectId & string fallback)
    const leaves = await Leave.find({
      $or: [
        { employeeId: empId },
        { employeeId: employeeId }, // fallback if string
      ],
    });

    // 5️⃣ Tasks (support BOTH ObjectId & string fallback)
    const tasks = await Task.find({
      $or: [
        { assignedTo: empId },
        { assignedTo: employeeId },
      ],
    });

    // 6️⃣ Task stats
    const taskStats = {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === "completed").length,
      pending: tasks.filter((t) => t.status === "pending").length,
      approved: tasks.filter((t) => t.status === "approved").length,
    };

    return res.json({
      employee: {
        name: user.name,
        employeeId: user.employeeId,
        email: user.email,
      },
      attendance,
      leaves,
      tasks,
      taskStats,
    });
  } catch (err) {
    console.error("❌ Employee analytics error:", err);
    return res.status(500).json({
      message: "Failed to load employee analytics",
      error: err.message,
    });
  }
};
