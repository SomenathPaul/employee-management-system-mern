// server/controllers/manager/userController.js
const User = require("../../models/users");

/**
 * GET /api/manager/employees
 * Returns list of users who have role: "Employee".
 * Supports optional query params: ?page=1&limit=25&search=xyz&department=Dev
 */
exports.listEmployees = async (req, res) => {
  try {
    // pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    // filters
    const filters = { role: "Employee" };

    if (req.query.department) filters.department = req.query.department;
    if (req.query.designation) filters.designation = req.query.designation;

    // search on name / email / employeeId
    if (req.query.search) {
      const q = req.query.search.trim();
      filters.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { employeeId: { $regex: q, $options: "i" } },
      ];
    }

    // fetch total count & paginated docs
    const [total, employees] = await Promise.all([
      User.countDocuments(filters),
      User.find(filters)
        .select("-password -securityAnswer -__v") // hide sensitive fields
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    res.json({
      meta: { total, page, limit, pages: Math.ceil(total / limit) || 1 },
      data: employees,
    });
  } catch (err) {
    console.error("manager.listEmployees error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * GET /api/manager/employees/:id
 * Get single employee by id
 */
exports.getEmployeeById = async (req, res) => {
  try {
    const id = req.params.id;
    const employee = await User.findById(id).select("-password -securityAnswer -__v");
    if (!employee) return res.status(404).json({ msg: "Employee not found" });
    if ((employee.role || "").toLowerCase() !== "employee")
      return res.status(400).json({ msg: "User is not an employee" });

    res.json(employee);
  } catch (err) {
    console.error("manager.getEmployeeById error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};


/**
 * PUT /api/manager/employees/:id
 * Update an employee (manager-only endpoint).
 * Whitelisted fields only — prevents privilege escalation.
 */
exports.updateEmployee = async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body || {};

    // allowed fields manager may change
    const allowed = [
      "name", "gender", "dob", "email", "phone", "address", "city", "state", "pincode", "country",
      "emergencyContactName", "emergencyPhone",
      "department", "designation", "employeeId", "joiningDate", "employmentType",
      "reportingManager", "workEmail", "workMode", "role"
    ];

    const update = {};
    allowed.forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(payload, k)) update[k] = payload[k];
    });

    // Basic validations
    if (update.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(update.email)) return res.status(400).json({ msg: "Invalid email format" });
    }
    if (update.phone && !/^\d{10}$/.test(String(update.phone))) return res.status(400).json({ msg: "Phone must be 10 digits" });
    if (update.emergencyPhone && update.emergencyPhone !== "" && !/^\d{10}$/.test(String(update.emergencyPhone))) return res.status(400).json({ msg: "Emergency phone must be 10 digits" });

    // Parse dates
    if (update.dob) update.dob = new Date(update.dob);
    if (update.joiningDate) update.joiningDate = new Date(update.joiningDate);

    // Ensure role stays valid if provided
    if (update.role && !["Admin", "HR", "Manager", "Employee"].includes(update.role)) {
      return res.status(400).json({ msg: "Invalid role value" });
    }

    // Update and return updated doc
    const updated = await User.findByIdAndUpdate(id, { $set: update }, { new: true }).select("-password -securityAnswer -__v");
    if (!updated) return res.status(404).json({ msg: "Employee not found" });

    return res.json(updated);
  } catch (err) {
    console.error("manager.updateEmployee error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};
