// server/controllers/settingsController.js
const User = require("../models/users");
const bcrypt = require("bcryptjs");

// ✅ Update user settings (profile + password + security)
exports.updateProfile = async (req, res) => {
  try {
    const {
      phone,
      address,
      securityQuestion,
      securityAnswer,
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // ✅ Update editable fields
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (securityQuestion) user.securityQuestion = securityQuestion;
    if (securityAnswer) user.securityAnswer = securityAnswer;

    // ✅ Handle password change only if user entered new password
    if (newPassword && confirmPassword && currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch)
        return res.status(400).json({ msg: "Current password is incorrect" });

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    await user.save();

    res.status(200).json({
      msg: "Settings updated successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        securityQuestion: user.securityQuestion,
        securityAnswer: user.securityAnswer,
      },
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ msg: "Error updating settings", error: error.message });
  }
};
