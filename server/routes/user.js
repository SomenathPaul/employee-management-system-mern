// server/routes/user.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const User = require("../models/users"); // your user model

// GET /api/user/me  -> protected, returns current user's data
router.get("/me", auth, async (req, res) => {
  try {
    // req.user.userId comes from authMiddleware
    const user = await User.findById(req.user.userId).select("-password -securityAnswer");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("GET /api/user/me error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
