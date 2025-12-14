// server/middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "notification_uploads"); // changed folder name
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/png","image/jpeg","image/jpg","image/webp"];
  cb(null, allowed.includes(file.mimetype));
};

// 1 MB limit (adjust if needed)
const upload = multer({ storage, fileFilter, limits: { fileSize: 1 * 1024 * 1024 } });

module.exports = upload;
