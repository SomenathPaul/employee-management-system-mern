// server/routes/employee/taskRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../../middleware/authMiddleware");
const taskController = require("../../controllers/taskController");
const upload = require("../../middleware/taskUpload");

router.get("/tasks", auth, taskController.getMyTasks);

router.put("/tasks/:id/progress", auth, taskController.updateTaskProgress);

router.post(
  "/tasks/:id/submit",
  auth,
  upload.single("file"),
  taskController.submitTaskByEmployee
);

module.exports = router;

