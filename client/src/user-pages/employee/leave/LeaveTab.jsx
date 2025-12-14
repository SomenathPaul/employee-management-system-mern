// client/src/user-pages/employee/leave/LeaveTab.jsx
import React, { useState, useEffect, useContext } from "react";
import { FaPaperPlane, FaClipboardList } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import AIButton from "../../../components/AIButton";
import { ThemeContext } from "../../../context/ThemeContext";

function LeaveTab() {
  const [formData, setFormData] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [user, setUser] = useState(null);
  const { isDark } = useContext(ThemeContext); // <-- inside component

  // Theme-based classes
  const pageBg = isDark ? "bg-app text-gray-200" : "bg-white text-gray-800";
  const panelBg = isDark ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-100";
  const inputBase = isDark
    ? "w-full border p-2 rounded-lg bg-slate-700 text-gray-100 border-slate-600 focus:ring-0 focus:border-indigo-500"
    : "w-full border p-2 rounded-lg bg-white text-gray-700 border-gray-300 focus:ring-0 focus:border-indigo-400";
  const selectBase = inputBase;
  const textareaBase = inputBase;
  const headerText = isDark ? "text-gray-100" : "text-gray-800";
  const tableText = isDark ? "text-gray-200" : "text-gray-800";
  const tableHeaderBg = isDark ? "bg-indigo-900 text-indigo-100" : "bg-indigo-100 text-gray-700";
  const rowHover = isDark ? "hover:bg-slate-800 border-slate-700" : "hover:bg-indigo-50 border-gray-200";

  // Load user details (from localStorage)
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUser(userData);
      fetchLeaves();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch leaves from backend
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

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // Submit leave request
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      Swal.fire("Error", "User not logged in!", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        employeeId: user.employeeId,
        name: user.name,
        role: user.role,
        leaveType: formData.leaveType,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        reason: formData.reason,
      };

      const res = await axios.post("http://localhost:5000/api/leaves/apply", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire("Success", res.data.msg, "success");
      setFormData({ leaveType: "", fromDate: "", toDate: "", reason: "" });
      fetchLeaves(); // Refresh list
    } catch (error) {
      const msg = error.response?.data?.msg || "Failed to submit leave request!";
      Swal.fire("Error", msg, "error");
    }
  };

  return (
    <div className={`h-full shadow-md p-6 overflow-y-auto ${pageBg}`}>
      {/* Header */}
      <div className={`mb-6 border-b pb-3 flex items-center justify-between ${isDark ? "border-slate-700" : "border-gray-200"}`}>
        <h2 className={`text-2xl font-semibold flex items-center gap-2 ${headerText}`}>
          <FaClipboardList className="text-indigo-500" /> Leave Requests
        </h2>
      </div>

      {/* Leave Form */}
      <div className={`${panelBg} border p-5 rounded-2xl shadow-sm mb-8`}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Employee ID (readonly) */}
          <div>
            <label className={`block font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>Employee ID</label>
            <input
              type="text"
              name="employeeId"
              value={user?.employeeId || ""}
              readOnly
              className={inputBase}
            />
          </div>

          {/* Leave Type */}
          <div>
            <label className={`block font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>Leave Type</label>
            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              required
              className={selectBase}
            >
              <option value="">Select Leave Type</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Earned Leave">Earned Leave</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className={`block font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>Start Date</label>
            <input
              type="date"
              name="fromDate"
              value={formData.fromDate}
              onChange={handleChange}
              required
              className={inputBase}
            />
          </div>

          {/* End Date */}
          <div>
            <label className={`block font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>End Date</label>
            <input
              type="date"
              name="toDate"
              value={formData.toDate}
              onChange={handleChange}
              required
              className={inputBase}
            />
          </div>

          {/* Reason */}
          <div className="md:col-span-2">
            <label className={`block font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>Reason</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Explain your reason..."
              rows="3"
              required
              className={textareaBase}
            />
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 text-right flex items-center justify-end gap-3">
            <AIButton name="Reason" />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg shadow hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <FaPaperPlane /> Submit Request
            </button>
          </div>
        </form>
      </div>

      {/* Leave History */}
      <div className={`${panelBg} border p-5 rounded-2xl shadow-sm`}>
        <h3 className={`text-lg font-semibold mb-4 ${headerText}`}>Leave Request History</h3>

        <div className="overflow-x-auto">
          <table className={`min-w-full border-collapse ${tableText}`}>
            <thead>
              <tr className={tableHeaderBg}>
                <th className="py-2 px-4 text-left">Type</th>
                <th className="py-2 px-4 text-left">From</th>
                <th className="py-2 px-4 text-left">To</th>
                <th className="py-2 px-4 text-left">Reason</th>
                <th className="py-2 px-4 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {leaveRequests && leaveRequests.length > 0 && user ? (
                leaveRequests
                  .filter((req) => req.employeeId === user.employeeId)
                  .map((req) => (
                    <tr key={req._id} className={`border-b transition-all ${rowHover}`}>
                      <td className="py-2 px-4">{req.leaveType}</td>
                      <td className="py-2 px-4">{req.fromDate}</td>
                      <td className="py-2 px-4">{req.toDate}</td>
                      <td className="py-2 px-4">{req.reason}</td>
                      <td
                        className={`py-2 px-4 font-semibold ${
                          req.status === "Approved"
                            ? (isDark ? "text-green-300" : "text-green-600")
                            : req.status === "Rejected"
                            ? (isDark ? "text-red-300" : "text-red-600")
                            : (isDark ? "text-yellow-300" : "text-yellow-600")
                        }`}
                      >
                        {req.status}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="5" className={`text-center py-4 ${isDark ? "text-gray-300" : "text-gray-500"}`}>
                    No leave records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LeaveTab;
