// server/routes/settingsRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { updateProfile } = require("../controllers/settingsController");

// ✅ Update user settings (profile + password + security)
router.put("/update-settings", authMiddleware, updateProfile);

module.exports = router;
