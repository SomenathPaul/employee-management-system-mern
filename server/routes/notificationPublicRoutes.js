// server/routes/notificationPublicRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Notification = require("../models/notification");

router.get("/", auth, async (req, res) => {
  try {
    // optional params: page, limit, search, type
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page -1) * limit;
    const filters = {};
    if (req.query.type) filters.type = req.query.type;
    if (req.query.search) {
      const q = req.query.search.trim();
      filters.$or = [{ title: { $regex: q, $options: "i"} }, { message: { $regex: q, $options: "i" } }];
    }

    const [total, data] = await Promise.all([
      Notification.countDocuments(filters),
      Notification.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit)
    ]);
    res.json({ meta: { total, page, limit, pages: Math.ceil(total/limit)||1 }, data });
  } catch (err) {
    console.error("public notifications error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
