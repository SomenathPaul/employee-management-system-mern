// server/controllers/leaveController.js
const Leave = require("../models/leave");
const mongoose = require("mongoose");

// helper to ensure valid ObjectId
function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ✅ Apply for Leave
exports.applyLeave = async (req, res) => {
  try {
    const { employeeId, name, role, leaveType, fromDate, toDate, reason } = req.body;

    if (!employeeId || !name || !role || !leaveType || !fromDate || !toDate || !reason) {
      return res.status(400).json({ msg: "All fields are required." });
    }

    const overlappingLeave = await Leave.findOne({
      employeeId,
      fromDate: { $lte: toDate },
      toDate: { $gte: fromDate },
    });

    if (overlappingLeave) {
      return res.status(400).json({ msg: "You already have a leave request in this period." });
    }

    const leave = new Leave({
      employeeId,
      name,
      role,
      leaveType,
      fromDate,
      toDate,
      reason,
    });

    await leave.save();
    res.status(201).json({ msg: "Leave applied successfully.", leave });
  } catch (error) {
    res.status(500).json({ msg: "Error applying leave", error: error.message });
  }
};

// ✅ Fetch leaves (works for both Admin & Employee)
exports.getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find();
    if (!leaves || leaves.length === 0) {
      return res.status(404).json({ msg: "No Leaves record found" });
    }
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ msg: "Error fetching leaves", error: error.message });
  }
};

// Verify leave: set status -> "Verified"
exports.verifyLeave = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ msg: "Invalid leave id" });

    const current = await Leave.findById(id);
    if (!current) return res.status(404).json({ msg: "Leave not found" });

    // only Pending -> Verified
    if (current.status !== "Pending") {
      return res.status(400).json({ msg: `Cannot verify leave with status '${current.status}'` });
    }

    // expired check (optional)
    const today = new Date();
    const to = new Date(current.toDate);
    if (to < today) {
      return res.status(400).json({ msg: "Cannot verify an expired leave" });
    }

    const updated = await Leave.findByIdAndUpdate(
      id,
      { status: "Verified" },
      { new: true, runValidators: true }
    );

    res.status(200).json({ msg: "Leave verified", leave: updated });
  } catch (err) {
    console.error("verifyLeave error:", err);
    res.status(500).json({ msg: "Error verifying leave", error: err.message });
  }
};

exports.approveLeave = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ msg: "Invalid leave id" });

    const current = await Leave.findById(id);
    if (!current) return res.status(404).json({ msg: "Leave not found" });

    if (current.status !== "Verified") {
      return res.status(400).json({ msg: "Only verified leaves can be approved" });
    }

    const updated = await Leave.findByIdAndUpdate(
      id,
      { status: "Approved" },
      { new: true, runValidators: true }
    );

    res.status(200).json({ msg: "Leave approved", leave: updated });
  } catch (err) {
    console.error("approveLeave error:", err);
    res.status(500).json({ msg: "Error approving leave", error: err.message });
  }
};

exports.rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ msg: "Invalid leave id" });

    const current = await Leave.findById(id);
    if (!current) return res.status(404).json({ msg: "Leave not found" });

    if (current.status !== "Verified") {
      return res.status(400).json({ msg: "Only verified leaves can be rejected" });
    }

    const updated = await Leave.findByIdAndUpdate(
      id,
      { status: "Rejected" },
      { new: true, runValidators: true }
    );

    res.status(200).json({ msg: "Leave rejected", leave: updated });
  } catch (err) {
    console.error("rejectLeave error:", err);
    res.status(500).json({ msg: "Error rejecting leave", error: err.message });
  }
};
