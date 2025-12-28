// client/src/components/settings/SettingsTab.jsx
import React, { useState, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FiUser, FiLock, FiShield, FiSave, FiInfo } from "react-icons/fi";

/* ===== Contexts ===== */
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";

/**
 * SettingsTab Component
 * Purpose: Allows users to manage their account profile, security credentials, and preferences.
 */
const SettingsTab = () => {
  /* ==================================================
      Context & State
  ================================================== */
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

  /* ==================================================
      Theme-based styling logic
  ================================================== */
  const pageBg = isDark ? "bg-slate-900 text-slate-100" : "bg-gray-50 text-slate-900";
  const cardBg = isDark ? "bg-slate-800/50 backdrop-blur-md border-slate-700 shadow-xl" : "bg-white border-gray-100 shadow-sm";
  const sectionBg = isDark ? "bg-slate-900/40 border border-white/5" : "bg-gray-50/50 border border-gray-100";
  
  const inputBase = isDark
    ? "w-full border px-4 py-2.5 rounded-xl bg-slate-800 text-slate-100 border-slate-600 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
    : "w-full border px-4 py-2.5 rounded-xl bg-white text-slate-800 border-gray-200 focus:ring-2 focus:ring-indigo-400/50 outline-none transition-all";

  const inputReadonly = isDark
    ? "w-full border px-4 py-2.5 rounded-xl bg-slate-900/50 text-slate-500 cursor-not-allowed border-slate-700 font-medium"
    : "w-full border px-4 py-2.5 rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200 font-medium";

  /* ==================================================
      Logic Handlers
  ================================================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Password Validation Logic
   * Requirements: 8+ chars, upper, lower, number, special char.
   */
  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    /* Validation Logic */
    if (formData.newPassword || formData.confirmPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        Swal.fire({ icon: "error", title: "Mismatch", text: "Passwords do not match!" });
        setLoading(false);
        return;
      }
      if (!validatePassword(formData.newPassword)) {
        Swal.fire({ icon: "warning", title: "Weak Password", text: "Min 8 chars, 1 uppercase, 1 lowercase, 1 number, and 1 special symbol required." });
        setLoading(false);
        return;
      }
    }

    try {
      const res = await axios.put(
        "http://localhost:5000/api/settings/update-settings",
        { ...formData },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      Swal.fire({ icon: "success", title: "Saved", text: res.data.msg || "Settings updated successfully!" });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: err.response?.data?.msg || "Update failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-4 md:p-8 w-full h-full transition-colors duration-300 ${pageBg} overflow-y-auto`}>
      <div className={`max-w-5xl mx-auto p-6 md:p-10 rounded-3xl border transition-all ${cardBg}`}>
        
        {/* --- Header Section --- */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500">
            <FiShield size={32} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Security & Settings</h2>
            <p className="text-sm opacity-60">Manage your profile details and account security.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* ===== SECTION: Profile Information ===== */}
          <section className={`p-6 rounded-2xl ${sectionBg}`}>
            <div className="flex items-center gap-2 mb-6">
              <FiUser className="text-indigo-500" />
              <h3 className="font-bold text-lg">Public Profile</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest opacity-50 ml-1">Full Name</label>
                <input type="text" value={formData.fullName} readOnly className={inputReadonly} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest opacity-50 ml-1">Email Address</label>
                <input type="email" value={formData.email} readOnly className={inputReadonly} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest opacity-50 ml-1">Phone Number</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className={inputBase} placeholder="+1 234 567 890" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest opacity-50 ml-1">Residential Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className={inputBase} placeholder="123 Street, City" />
              </div>
            </div>
          </section>

          {/* ===== SECTION: Authentication ===== */}
          <section className={`p-6 rounded-2xl ${sectionBg}`}>
            <div className="flex items-center gap-2 mb-6">
              <FiLock className="text-amber-500" />
              <h3 className="font-bold text-lg">Change Password</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest opacity-50 ml-1">Current Password</label>
                <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} className={inputBase} placeholder="••••••••" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest opacity-50 ml-1">New Password</label>
                <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className={inputBase} placeholder="••••••••" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest opacity-50 ml-1">Confirm New</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={inputBase} placeholder="••••••••" />
              </div>
            </div>
          </section>

          {/* ===== SECTION: Account Recovery ===== */}
          <section className={`p-6 rounded-2xl ${sectionBg}`}>
            <div className="flex items-center gap-2 mb-6">
              <FiShield className="text-emerald-500" />
              <h3 className="font-bold text-lg">Security Preferences</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest opacity-50 ml-1">Security Question</label>
                <select name="securityQuestion" value={formData.securityQuestion} onChange={handleChange} className={inputBase}>
                  <option value="">Select a question</option>
                  <option value="Your first pet's name?">Your first pet's name?</option>
                  <option value="Your mother's maiden name?">Your mother's maiden name?</option>
                  <option value="Your favorite teacher's name?">Your favorite teacher's name?</option>
                  <option value="Your birth city?">Your birth city?</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest opacity-50 ml-1">Your Answer</label>
                <input type="text" name="securityAnswer" value={formData.securityAnswer} onChange={handleChange} className={inputBase} placeholder="Secure answer" />
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-2 text-xs opacity-50 italic">
              <FiInfo /> This will be used for account recovery if you forget your password.
            </div>
          </section>

          {/* ===== Footer: Submit Actions ===== */}
          <div className="flex justify-end pt-4 border-t border-slate-700/20">
            <button 
              type="submit" 
              disabled={loading} 
              className={`flex items-center gap-2 px-10 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 
                ${isDark ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20" : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"}`}
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave />}
              {loading ? "Syncing..." : "Save Changes"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SettingsTab;