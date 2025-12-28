// server/routes/manager/analyticsRoutes.js
const express = require("express");
const router = express.Router();

const auth = require("../../middleware/authMiddleware");
const analyticsController = require("../../controllers/manager/analyticsController");

/* ---------- Manager-only guard ---------- */
// const managerOnly = (req, res, next) => {
//   if (req.user.role !== "manager") {
//     return res.status(403).json({ message: "Manager access only" });
//   }
//   next();
// };

/* ---------- Routes ---------- */
router.get(
  "/employee/:employeeId",
  auth,
//   managerOnly,
  analyticsController.getEmployeeFullAnalytics
);

module.exports = router;
