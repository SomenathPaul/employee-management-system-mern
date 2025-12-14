// server/routes/auth.js
const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/register"); // your controller file
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// ensure uploads folder exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// register (multipart/form-data -> photo + signature + other fields)
router.post(
  "/register",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]),
  register
);

// login (JSON)
router.post("/login", login);

module.exports = router;
