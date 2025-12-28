// client/src/user-pages/employee/leave/LeaveTab.jsx
import React, { useState, useEffect, useContext } from "react";
import { FaPaperPlane, FaClipboardList, FaCalendarAlt, FaInfoCircle } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import AIButton from "../../../components/AIButton";
import { ThemeContext } from "../../../context/ThemeContext";

/**
 * LeaveTab Component
 * Allows employees to submit leave requests and track their application history.
 * Fully responsive and integrates with a ThemeContext for Dark/Light modes.
 */
function LeaveTab() {
  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [user, setUser] = useState(null);
  const { isDark } = useContext(ThemeContext);

  // --- THEME-BASED DYNAMIC CLASSES ---
  const pageBg = isDark ? "bg-slate-900 text-slate-200" : "bg-gray-50 text-slate-800";
  const cardBg = isDark ? "bg-slate-800/50 backdrop-blur-md border-slate-700" : "bg-white border-gray-100 shadow-sm";
  const inputBase = isDark
    ? "w-full border p-2.5 rounded-xl bg-slate-700 text-slate-100 border-slate-600 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
    : "w-full border p-2.5 rounded-xl bg-white text-slate-700 border-gray-300 focus:ring-2 focus:ring-indigo-400/50 outline-none transition-all";
  const labelStyle = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`;

  // --- INITIALIZATION & DATA FETCHING ---
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUser(userData);
      fetchLeaves();
    }
  }, []);

  /**
   * Retrieves leave history from the backend using the user's auth token.
   */
  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/leaves/show", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaveRequests(res.data || []);
    } catch (error) {
      console.error("Error fetching leaves:", error);
    }
  };

  /**
   * Handles form input changes and updates state.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  /**
   * Submits the leave request to the server after performing basic validation.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      Swal.fire("Error", "User not logged in!", "error");
      return;
    }

    // Basic Logic Check: Start date shouldn't be after end date
    if (new Date(formData.fromDate) > new Date(formData.toDate)) {
      Swal.fire("Wait!", "Start Date cannot be later than End Date", "warning");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        employeeId: user.employeeId,
        name: user.name,
        role: user.role,
        ...formData
      };

      const res = await axios.post("http://localhost:5000/api/leaves/apply", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire({
        title: "Request Sent",
        text: res.data.msg,
        icon: "success",
        confirmButtonColor: "#4f46e5"
      });
      
      setFormData({ leaveType: "", fromDate: "", toDate: "", reason: "" });
      fetchLeaves(); // Refresh the history table
    } catch (error) {
      const msg = error.response?.data?.msg || "Failed to submit leave request!";
      Swal.fire("Error", msg, "error");
    }
  };

  return (
    <div className={`h-full p-4 md:p-8 overflow-y-auto transition-colors duration-300 ${pageBg}`}>
      
      {/* --- PAGE HEADER --- */}
      <div className="max-w-6xl mx-auto flex items-center gap-3 mb-8">
        <div className={`p-3 rounded-2xl ${isDark ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-600 text-white"}`}>
          <FaClipboardList size={24} />
        </div>
        <div>
          <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            Leave Management
          </h2>
          <p className="text-sm opacity-60">Apply for time off and track your request status.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 gap-8">
        
        {/* --- LEAVE APPLICATION FORM --- */}
        <section className={`${cardBg} p-6 md:p-8 rounded-3xl border transition-all shadow-lg`}>
          <div className="flex items-center gap-2 mb-6 border-b border-inherit pb-4">
            <FaCalendarAlt className="text-indigo-500" />
            <h3 className="font-bold text-lg">Apply for Leave</h3>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Read-only Employee ID */}
            <div className="opacity-70">
              <label className={labelStyle}>Employee ID</label>
              <input type="text" value={user?.employeeId || ""} readOnly className={inputBase} />
            </div>

            {/* Leave Type Select */}
            <div>
              <label className={labelStyle}>Leave Type</label>
              <select name="leaveType" value={formData.leaveType} onChange={handleChange} required className={inputBase}>
                <option value="">Select Category</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Casual Leave">Casual Leave</option>
                <option value="Earned Leave">Earned Leave</option>
              </select>
            </div>

            {/* Date Range Selection */}
            <div>
              <label className={labelStyle}>Start Date</label>
              <input type="date" name="fromDate" value={formData.fromDate} onChange={handleChange} required className={inputBase} />
            </div>

            <div>
              <label className={labelStyle}>End Date</label>
              <input type="date" name="toDate" value={formData.toDate} onChange={handleChange} required className={inputBase} />
            </div>

            {/* Reason Textarea */}
            <div className="md:col-span-2">
              <label className={labelStyle}>Reason for Absence</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Briefly explain your requirement..."
                rows="3"
                required
                className={`${inputBase} resize-none`}
              />
            </div>

            {/* Form Actions */}
            <div className="md:col-span-2 flex flex-col sm:flex-row items-center justify-end gap-4 mt-2">
              <div className="w-full sm:w-auto">
                {/* <AIButton name="Reason" /> Logic preserved */}
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-2xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <FaPaperPlane /> Submit Request
              </button>
            </div>
          </form>
        </section>

        {/* --- LEAVE REQUEST HISTORY --- */}
        <section className={`${cardBg} p-6 md:p-8 rounded-3xl border transition-all shadow-lg`}>
          <div className="flex items-center gap-2 mb-6">
            <FaInfoCircle className="text-indigo-500" />
            <h3 className="font-bold text-lg">History & Tracking</h3>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-inherit">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className={`${isDark ? "bg-slate-700/50 text-slate-300" : "bg-slate-50 text-slate-600"} uppercase text-[10px] font-black tracking-widest`}>
                  <th className="py-4 px-6">Leave Type</th>
                  <th className="py-4 px-6">Duration</th>
                  <th className="py-4 px-6">Reason</th>
                  <th className="py-4 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-700" : "divide-gray-100"}`}>
                {leaveRequests.length > 0 && user ? (
                  leaveRequests
                    .filter((req) => req.employeeId === user.employeeId)
                    .map((req) => (
                      <tr key={req._id} className={`transition-colors ${isDark ? "hover:bg-slate-700/30" : "hover:bg-indigo-50/30"}`}>
                        <td className="py-4 px-6 font-bold">{req.leaveType}</td>
                        <td className="py-4 px-6 whitespace-nowrap opacity-80">
                          {req.fromDate} <span className="mx-1">→</span> {req.toDate}
                        </td>
                        <td className="py-4 px-6 max-w-xs truncate opacity-70" title={req.reason}>
                          {req.reason}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-center">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm
                              ${req.status === "Approved" ? (isDark ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : "bg-emerald-100 text-emerald-700") :
                                req.status === "Rejected" ? (isDark ? "bg-rose-500/20 text-rose-400 border border-rose-500/20" : "bg-rose-100 text-rose-700") :
                                (isDark ? "bg-amber-500/20 text-amber-400 border border-amber-500/20" : "bg-amber-100 text-amber-700")}`}
                            >
                              {req.status}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-12 opacity-50 italic">
                      No leave applications found in your records.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LeaveTab;