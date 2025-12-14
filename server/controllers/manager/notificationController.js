// server/controllers/manager/notificationController.js
const Notification = require("../../models/notification");
const path = require("path");

exports.createNotification = async (req, res) => {
  try {
    const { title, message, type, visibleTo } = req.body;
    if (!title || !message) return res.status(400).json({ msg: "Title and message are required." });

    const payload = {
      title, message, type: type || "Announcement", visibleTo: visibleTo || "All",
      createdBy: req.user.userId,
      createdByName: req.user.name || req.user.role || "Manager"
    };

    if (req.file) payload.image = req.file.filename;

    const n = new Notification(payload);
    await n.save();
    res.status(201).json(n);
  } catch (err) {
    console.error("createNotification error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.listNotifications = async (req, res) => {
  try {
    // optional query params: ?limit=20&page=1&type=Announcement&search=diwali
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const filters = {};
    if (req.query.type) filters.type = req.query.type;
    if (req.query.search) {
      const q = req.query.search.trim();
      filters.$or = [{ title: { $regex: q, $options: "i" } }, { message: { $regex: q, $options: "i" } }];
    }

    const [total, data] = await Promise.all([
      Notification.countDocuments(filters),
      Notification.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit)
    ]);

    res.json({ meta: { total, page, limit, pages: Math.ceil(total/limit) || 1 }, data });
  } catch (err) {
    console.error("listNotifications error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getNotification = async (req, res) => {
  try {
    const doc = await Notification.findById(req.params.id);
    if (!doc) return res.status(404).json({ msg: "Notification not found" });
    res.json(doc);
  } catch (err) {
    console.error("getNotification error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const doc = await Notification.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ msg: "Not found" });
    res.json({ msg: "Deleted", id: req.params.id });
  } catch (err) {
    console.error("deleteNotification error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
