// server/controllers/manager/taskController.js
const Task = require("../../models/task");
const User = require("../../models/users"); // for optional lookups

// POST /api/manager/tasks
exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedTo = [], dueDate, priority, tags = [] } = req.body;
    if (!title || !Array.isArray(assignedTo) || assignedTo.length === 0) {
      return res.status(400).json({ msg: "Title and at least one assignee are required." });
    }

    const createdBy = {
      userId: req.user?.userId,
      name: req.user?.name || undefined,
      role: req.user?.role || undefined,
    };

    const task = new Task({
      title,
      description,
      assignedTo,
      dueDate: dueDate || null,
      priority: priority || "Medium",
      tags: Array.isArray(tags) ? tags : [],
      createdBy,
    });

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    console.error("createTask error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// GET /api/manager/tasks  (paginated + search)
exports.listTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const filters = {};
    if (req.query.search) {
      const q = req.query.search.trim();
      filters.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { "assignedTo.employeeId": { $regex: q, $options: "i" } },
        { "assignedTo.name": { $regex: q, $options: "i" } },
      ];
    }
    if (req.query.status) filters.status = req.query.status;
    if (req.query.priority) filters.priority = req.query.priority;

    const [total, data] = await Promise.all([
      Task.countDocuments(filters),
      Task.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ]);

    res.json({
      meta: { total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) },
      data,
    });
  } catch (err) {
    console.error("listTasks error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// GET /api/manager/tasks/:id
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: "Task not found" });
    res.json(task);
  } catch (err) {
    console.error("getTask error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// PUT /api/manager/tasks/:id  (manager edits)
exports.updateTask = async (req, res) => {
  try {
    const updates = (({ title, description, assignedTo, dueDate, priority, tags, status }) => ({ title, description, assignedTo, dueDate, priority, tags, status }))(req.body);
    // Remove undefined keys
    Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

    const task = await Task.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!task) return res.status(404).json({ msg: "Task not found" });
    res.json(task);
  } catch (err) {
    console.error("updateTask error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// PATCH /api/manager/tasks/:id/status  (both manager and employees can update status; employees limited to allowed statuses)
exports.patchStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ msg: "Status required" });

    // allowed statuses (same enum as model)
    const allowed = ["Pending", "In Progress", "Completed", "Cancelled"];
    if (!allowed.includes(status)) return res.status(400).json({ msg: "Invalid status" });

    // Optionally: if user.role is 'Employee', ensure they are an assignee of this task
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    const actorRole = (req.user && req.user.role) || "";
    if (String(actorRole).toLowerCase() === "employee") {
      // check if employee is assigned
      // determine employeeId: either JWT contains employeeId or fetch from users collection
      let employeeId = req.user.employeeId;
      if (!employeeId) {
        const u = await User.findById(req.user.userId).select("employeeId");
        employeeId = u?.employeeId;
      }
      if (!employeeId) return res.status(403).json({ msg: "Cannot determine employee identity" });

      const isAssigned = task.assignedTo.some((a) => String(a.employeeId) === String(employeeId));
      if (!isAssigned) return res.status(403).json({ msg: "You are not assigned to this task" });
    }

    task.status = status;
    await task.save();
    res.json(task);
  } catch (err) {
    console.error("patchStatus error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// DELETE /api/manager/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ msg: "Task not found" });
    res.json({ msg: "Task deleted" });
  } catch (err) {
    console.error("deleteTask error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// GET /api/manager/tasks/employee/me  -> tasks assigned to current employee
exports.listMyTasks = async (req, res) => {
  try {
    // determine employeeId: prefer token's employeeId if you included it, else read from users collection
    let employeeId = req.user.employeeId;
    if (!employeeId) {
      const u = await User.findById(req.user.userId).select("employeeId");
      employeeId = u?.employeeId;
    }
    if (!employeeId) return res.status(400).json({ msg: "Employee identifier missing" });

    const tasks = await Task.find({ "assignedTo.employeeId": employeeId }).sort({ dueDate: 1, createdAt: -1 });
    res.json({ meta: { total: tasks.length }, data: tasks });
  } catch (err) {
    console.error("listMyTasks error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
