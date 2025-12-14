// server/models/users.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // Step 1: Personal Details
  name: { type: String, required: true, minlength: 3 },
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  dob: { type: Date },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  country: { type: String },
  emergencyContactName: { type: String },
  emergencyPhone: { type: String },

  // Step 2: Employee Details
  role: {
    type: String,
    enum: ["Admin", "HR", "Manager", "Employee"],
    default: "Employee",
  },
  employeeId: { type: String },
  department: { type: String },
  designation: { type: String },
  joiningDate: { type: Date },
  employmentType: {
    type: String,
    enum: ["Full-Time", "Part-Time", "Internship", "Contract"],
  },
  reportingManager: { type: String },
  workEmail: { type: String },
  workMode: { type: String, enum: ["Onsite", "Remote", "Hybrid"] },

  // Step 3: Documents & Account Setup
  photo: { type: String }, // File path or URL
  signature: { type: String }, // File path or URL
  password: { type: String, required: true },
  securityQuestion: { type: String },
  securityAnswer: { type: String },
  termsAccepted: { type: Boolean, default: false },

  // Metadata
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("users", userSchema, "registers");
