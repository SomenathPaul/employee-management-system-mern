// server/routes/manager/taskRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../../middleware/authMiddleware");
const role = require("../../middleware/roleMiddleware"); // usage: role("Manager","HR","Admin")
const controller = require("../../controllers/manager/taskController");

// Manager operations (create, list, get, update, delete)
router.post("/", auth, role("Manager","HR","Admin"), controller.createTask);
router.get("/", auth, role("Manager","HR","Admin"), controller.listTasks);
router.get("/:id", auth, role("Manager","HR","Admin"), controller.getTask);
router.put("/:id", auth, role("Manager","HR","Admin"), controller.updateTask);
router.delete("/:id", auth, role("Manager","HR","Admin"), controller.deleteTask);

// Status patch - allow both managers and employees (auth required)
router.patch("/:id/status", auth, controller.patchStatus);

// Employee-specific: get tasks for current employee
router.get("/employee/me", auth, controller.listMyTasks);

module.exports = router;
