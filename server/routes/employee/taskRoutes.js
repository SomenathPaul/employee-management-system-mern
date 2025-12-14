// server/routes/employee/tasks.js
const express = require("express");
const router = express.Router();
const auth = require("../../middleware/authMiddleware");
const taskController = require("../../controllers/taskController");

// GET my tasks (paginated)
router.get("/tasks", auth, taskController.getMyTasks);

// update progress/status
router.put("/tasks/:id/progress", auth, taskController.updateTaskProgress);

module.exports = router;
