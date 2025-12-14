// server/controllers/taskController.js
const Task = require("../models/task");
const User = require("../models/users");

/**
 * GET /api/employee/tasks
 * - returns tasks assigned to the requesting user (by userId or employeeId)
 * - supports ?page & ?limit & ?search optional
 */
exports.getMyTasks = async (req, res) => {
  try {
    const userId = req.user?.userId; // from token
    if (!userId) return res.status(401).json({ msg: "Unauthorized" });

    // fetch user record to read employeeId if needed
    const user = await User.findById(userId).select("employeeId role");
    const employeeId = user?.employeeId;

    const { page = 1, limit = 50, search } = req.query;
    const skip = (page - 1) * limit;

    const filters = {
      $or: [],
    };

    // tasks where assignedTo contains this user _id
    filters.$or.push({ assignedTo: userId });

    // tasks where assignedEmployeeIds contains this user's employeeId (if present)
    if (employeeId) filters.$or.push({ assignedEmployeeIds: employeeId });

    // If manager accidentally assigned by email, also match by email (optional)
    // e.g. filters.$or.push({ "assignedEmails": user.email });

    // If search param present, add text match on title/description
    if (search && typeof search === "string") {
      const q = search.trim();
      filters.$and = [
        {
          $or: [
            { title: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
            { assignedEmployeeIds: { $regex: q, $options: "i" } },
          ],
        },
      ];
    }

    // If no OR entries created, return empty
    if (!filters.$or.length) {
      return res.json({ meta: { total: 0, page: 1, limit }, data: [] });
    }

    // build final query: if $and exists, include otherwise just $or
    const finalQuery = filters.$and ? { $and: filters.$and, $or: filters.$or } : { $or: filters.$or };

    const [total, data] = await Promise.all([
      Task.countDocuments(finalQuery),
      Task.find(finalQuery)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .lean(),
    ]);

    res.json({
      meta: { total, page: Number(page), limit: Number(limit), pages: Math.max(1, Math.ceil(total / Number(limit))) },
      data,
    });
  } catch (err) {
    console.error("getMyTasks error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * PUT /api/employee/tasks/:id/progress
 * Body: { progress?: number, status?: string }
 * - Only assigned employee(s) can update
 */
exports.updateTaskProgress = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ msg: "Unauthorized" });

    const taskId = req.params.id;
    const { progress, status } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    // fetch current user's employeeId for comparison
    const user = await User.findById(userId).select("employeeId role");
    const employeeId = user?.employeeId;

    const isAssignedByUserId = (task.assignedTo || []).some((a) => String(a) === String(userId));
    const isAssignedByEmployeeId = employeeId && (task.assignedEmployeeIds || []).some((e) => String(e) === String(employeeId));

    if (!isAssignedByUserId && !isAssignedByEmployeeId) {
      return res.status(403).json({ msg: "Not allowed: you are not assigned to this task" });
    }

    // validate and set
    if (typeof progress !== "undefined") {
      const p = Number(progress);
      if (Number.isNaN(p) || p < 0 || p > 100) {
        return res.status(400).json({ msg: "Invalid progress value" });
      }
      task.progress = p;
      // optionally set status automatically
      if (p === 100) task.status = "Completed";
      else if (task.status === "Assigned") task.status = "In Progress";
    }

    if (typeof status !== "undefined") {
      // prevent employee from setting invalid status (manager-only statuses can be restricted)
      const allowed = ["Assigned", "In Progress", "Blocked", "Completed", "Cancelled"];
      if (!allowed.includes(status)) return res.status(400).json({ msg: "Invalid status" });
      // employees should not be able to set 'Assigned' back from Completed? you can restrict here if needed
      task.status = status;
      if (status === "Completed") task.progress = 100;
    }

    await task.save();
    return res.json({ msg: "Task updated", task });
  } catch (err) {
    console.error("updateTaskProgress error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
