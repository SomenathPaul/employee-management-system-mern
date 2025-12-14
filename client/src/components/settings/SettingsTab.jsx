// client/src/components/settings/SettingsTab.jsx
import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import Swal from "sweetalert2";
import { ThemeContext } from "../../context/ThemeContext";

const SettingsTab = () => {
  const { user, token } = useContext(AuthContext);
  const { isDark } = useContext(ThemeContext);

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    securityQuestion: "",
    securityAnswer: "",
  });

  const [loading, setLoading] = useState(false);

  // Theme classes
  const pageBg = isDark ? "bg-app text-gray-200" : "bg-white text-gray-800";
  const panelBg = isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200";
  const sectionTitle = isDark ? "text-gray-100" : "text-gray-800";
  const labelText = isDark ? "text-gray-300" : "text-gray-700";
  const inputBase = isDark
    ? "w-full border px-3 py-2 rounded bg-slate-700 text-gray-100 border-slate-600 focus:outline-none focus:border-indigo-400"
    : "w-full border px-3 py-2 rounded bg-white text-gray-800 border-gray-300 focus:outline-none focus:border-indigo-400";
  const inputReadonly = isDark
    ? "w-full border px-3 py-2 rounded bg-slate-700 text-gray-300 cursor-not-allowed border-slate-600"
    : "w-full border px-3 py-2 rounded bg-gray-100 text-gray-700 cursor-not-allowed border-gray-300";
  const selectBase = inputBase;
  const btnPrimary = isDark
    ? "bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded disabled:opacity-60"
    : "bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:opacity-60";

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // Password Validation
  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/;
    return regex.test(password);
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Password checks only if user entered new password
    if (formData.newPassword || formData.confirmPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        Swal.fire({
          icon: "error",
          title: "Password Mismatch",
          text: "New Password and Confirm Password do not match!",
        });
        setLoading(false);
        return;
      }

      if (!validatePassword(formData.newPassword)) {
        Swal.fire({
          icon: "warning",
          title: "Weak Password",
          text: "Password must include uppercase, lowercase, number, and special character (min 8 characters).",
        });
        setLoading(false);
        return;
      }
    }

    try {
      const res = await axios.put(
        "http://localhost:5000/api/settings/update-settings",
        {
          phone: formData.phone,
          address: formData.address,
          securityQuestion: formData.securityQuestion,
          securityAnswer: formData.securityAnswer,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Success",
        text: res.data.msg || "Changes saved successfully!",
      });
    } catch (err) {
      console.error("Update error:", err);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text:
          err.response?.data?.msg ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-6 w-full h-full ${pageBg}`}>
      <div className={`w-full h-full p-6 rounded-lg ${panelBg}`}>
        <h2 className={`text-2xl font-semibold mb-3 ${sectionTitle}`}>Account Settings</h2>
        <hr className={isDark ? "border-slate-700 mb-4" : "border-gray-200 mb-4"} />

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Profile Info */}
          <div>
            <h3 className={`text-lg font-semibold mb-3 ${sectionTitle}`}>Profile Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block mb-1 ${labelText}`}>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  readOnly
                  className={inputReadonly}
                />
              </div>
              <div>
                <label className={`block mb-1 ${labelText}`}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  className={inputReadonly}
                />
              </div>
              <div>
                <label className={`block mb-1 ${labelText}`}>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputBase}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className={`block mb-1 ${labelText}`}>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={inputBase}
                  placeholder="Enter address"
                />
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div>
            <h3 className={`text-lg font-semibold mb-3 ${sectionTitle}`}>Change Password</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={`block mb-1 ${labelText}`}>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className={inputBase}
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className={`block mb-1 ${labelText}`}>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={inputBase}
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className={`block mb-1 ${labelText}`}>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={inputBase}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>

          {/* Security Preferences */}
          <div>
            <h3 className={`text-lg font-semibold mb-3 ${sectionTitle}`}>Security Preferences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block mb-1 ${labelText}`}>Security Question</label>
                <select
                  name="securityQuestion"
                  onChange={handleChange}
                  className={selectBase}
                  value={formData.securityQuestion}
                >
                  <option value="">Select Security Question</option>
                  <option value="Your first pet's name?">
                    Your first pet's name?
                  </option>
                  <option value="Your mother's maiden name?">
                    Your mother's maiden name?
                  </option>
                  <option value="Your favorite teacher's name?">
                    Your favorite teacher's name?
                  </option>
                  <option value="Your birth city?">Your birth city?</option>
                </select>
              </div>

              <div>
                <label className={`block mb-1 ${labelText}`}>Security Answer</label>
                <input
                  type="text"
                  name="securityAnswer"
                  value={formData.securityAnswer}
                  onChange={handleChange}
                  className={inputBase}
                  placeholder="Enter your security answer"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className={btnPrimary}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsTab;
