const mongoose = require("mongoose");

const userSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  loginAt: { type: Date, required: true },
  logoutAt: { type: Date },
  durationMs: { type: Number, default: 0 },
  date: { type: String, required: true }, // YYYY-MM-DD
});

module.exports = mongoose.model("UserSession", userSessionSchema);
