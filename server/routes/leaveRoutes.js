// server/routes/leaveRoutes.js
const express = require("express");
const router = express.Router();
const {
  applyLeave,
  getLeaves,
} = require("../controllers/leaveController");
const authMiddleware = require("../middleware/authMiddleware");

// Employee & Admin Routes
router.post("/apply", authMiddleware, applyLeave);
router.get("/show", authMiddleware, getLeaves);
// router.put("/update/:id", authMiddleware, updateLeaveStatus);

module.exports = router;
