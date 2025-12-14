// server/routes/manager/userRoutes.js
const express = require("express");
const router = express.Router();
const managerController = require("../../controllers/manager/userController");
const auth = require("../../middleware/authMiddleware");
const role = require("../../middleware/roleMiddleware");

// All manager routes protected: must be authenticated and role = Manager
router.get("/employees", auth, role("Manager"), managerController.listEmployees);
// GET single
router.get("/employees/:id", auth, role("Manager"), managerController.getEmployeeById);

// PUT /api/manager/employees/:id
router.put("/employees/:id", auth, role ? role("Manager") : auth, managerController.updateEmployee);


module.exports = router;
