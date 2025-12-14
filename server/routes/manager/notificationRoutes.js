// server/routes/manager/notificationRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../../middleware/authMiddleware");
const role = require("../../middleware/roleMiddleware");
const upload = require("../../middleware/upload");
const controller = require("../../controllers/manager/notificationController");

// Manager/HR/Admin create, list, delete
router.post("/", auth, role("Manager","HR","Admin"), upload.single("image"), controller.createNotification);
router.get("/", auth, role("Manager","HR","Admin"), controller.listNotifications);
router.get("/:id", auth, role("Manager","HR","Admin"), controller.getNotification);
router.delete("/:id", auth, role("Manager","HR","Admin"), controller.deleteNotification);

module.exports = router;
