// server/models/notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  type: { type: String, enum: ["Announcement", "Blog", "Notice", "Update"], default: "Announcement" },
  image: { type: String }, // filename or full URL
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  createdByName: { type: String },
  visibleTo: { type: String, enum: ["All", "Employees", "Managers"], default: "All" }, // optional
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", notificationSchema, "notifications");
