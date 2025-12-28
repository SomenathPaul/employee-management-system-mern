// server/controllers/register.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const Attendance = require("../models/attendance");
// const REQUIRED_MS = 5 * 60 * 60 * 1000; // 5 hours


exports.register = async (req, res) => {
  try {
    const {
      name, gender, dob, email, phone, address, city, state, pincode, country,
      emergencyContactName, emergencyPhone,
      role, employeeId, department, designation, joiningDate, employmentType,
      reportingManager, workEmail, workMode,
      password,
      securityQuestion, securityAnswer, termsAccepted,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, msg: "Please fill all required fields" });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ success: false, msg: "User already exists" });

    if (!req.body.emailVerified) {
  return res.status(400).json({
    msg: "Email not verified",
  });
}

// const EmailOtp = require("../models/EmailOtp");

// const otpRecord = await EmailOtp.findOne({
//   email: req.body.email,
//   verified: true,
// });

// if (!otpRecord) {
//   return res.status(400).json({
//     msg: "Email not verified"
//   });
// }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let photo = null, signature = null;
    if (req.files) {
      if (req.files.photo && req.files.photo.length > 0) {
        photo = req.files.photo[0].filename;
      }
      if (req.files.signature && req.files.signature.length > 0) {
        signature = req.files.signature[0].filename;
      }
    }

    user = new User({
      name, gender, dob, email, phone, address, city, state, pincode, country,
      emergencyContactName, emergencyPhone,
      role, employeeId, department, designation, joiningDate, employmentType,
      reportingManager, workEmail, workMode,
      photo, signature,
      password: hashedPassword,
      securityQuestion, securityAnswer,
      termsAccepted,
      emailVerified: true,
    });

    await user.save();

    const payload = { userId: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

    // ✅ Always send JSON back
    res.status(201).json({
      success: true,
      msg: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });

  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({
      success: false,
      msg: "Server error during registration",
      error: err.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, msg: "Missing credentials" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, msg: "Invalid credentials" });

    const payload = { userId: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

if (user.role.toLowerCase() === "employee") {
  const today = new Date().toISOString().slice(0, 10);

  try {
    await Attendance.findOneAndUpdate(
      { user: user._id, date: today },
      {
        $setOnInsert: {
          user: user._id,
          employeeId: user.employeeId,
          employeeName: user.name,
          date: today,
          startTime: new Date(),
          status: "PENDING",
        },
      },
      { upsert: true }
    );
  } catch (err) {
    if (err.code !== 11000) throw err;
  }
}



    



    res.json({
      success: true,
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gender: user.gender,
        photo: user.photo,
        designation: user.designation,
        country: user.country,
        department: user.department,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        employeeId: user.employeeId,
        joiningDate: user.joiningDate,
        employmentType: user.employmentType,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      msg: "Server error during login",
      error: err.message,
    });
  }
};


