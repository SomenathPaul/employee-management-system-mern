// server/routes/manager/leaveRoutes.js
const express = require("express");
const router = express.Router();
const leaveController = require("../../controllers/leaveController");
const auth = require("../../middleware/authMiddleware");
const ensureRole = require("../../middleware/roleMiddleware");

// Use auth + role check so only manager/hr/admin can call these routes
router.get("/getLeaves", auth, ensureRole("Manager","HR","Admin"), leaveController.getLeaves);

// individual actions
router.put("/:id/verify", auth, ensureRole("Manager","HR","Admin"), leaveController.verifyLeave);
router.put("/:id/approve", auth, ensureRole("Manager","HR","Admin"), leaveController.approveLeave);
router.put("/:id/reject", auth, ensureRole("Manager","HR","Admin"), leaveController.rejectLeave);

module.exports = router;
