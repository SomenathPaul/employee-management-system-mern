// server/controllers/emailController.js
const crypto = require("crypto");
const EmailOtp = require("../models/EmailOtp");
const sendEmail = require("../utils/sendEmail");

// helper
const hashOtp = (otp) =>
  crypto.createHash("sha256").update(otp).digest("hex");



// ================= SEND OTP =================
exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ msg: "Email required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return res.status(400).json({ msg: "Invalid email format" });
}
const existingOtp = await EmailOtp.findOne({ email });

if (existingOtp && existingOtp.expiresAt > Date.now()) {
  return res.status(429).json({
    msg: "OTP already sent. Please wait before requesting again."
  });
}


  try {
    // remove old OTPs
    await EmailOtp.deleteMany({ email });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await EmailOtp.create({
      email,
      otpHash: hashOtp(otp),
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 min
    });

    await sendEmail(
      email,
      "Your Email Verification OTP",
      `Your OTP is ${otp}. It is valid for 5 minutes.`
    );

    res.json({ msg: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to send OTP" });
  }
};

// ================= VERIFY OTP =================
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ msg: "Email and OTP required" });
  }

  try {
    const record = await EmailOtp.findOne({ email });

    if (!record) {
      return res.status(400).json({ msg: "OTP not found" });
    }

    if (record.expiresAt < Date.now()) {
      await EmailOtp.deleteOne({ email });
      return res.status(400).json({ msg: "OTP expired" });
    }

    if (hashOtp(otp) !== record.otpHash) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    record.verified = true;
await record.save();

res.json({ msg: "Email verified successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "OTP verification failed" });
  }
};
