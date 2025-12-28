// server/models/task.js
const mongoose = require("mongoose");

const AssigneeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  name: { type: String },
});

const TaskSubmissionSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  assignedTo: { type: [AssigneeSchema], default: [] },

  createdBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    name: { type: String },
    role: { type: String },
  },

  dueDate: { type: Date },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High", "Critical"],
    default: "Medium",
  },
  tags: { type: [String], default: [] },

  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed", "Cancelled"],
    default: "Pending",
  },

  // 🔹 NEW (employee submission)
  submissions: { type: [TaskSubmissionSchema], default: [] },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

taskSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

taskSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model("Task", taskSchema, "tasks");
