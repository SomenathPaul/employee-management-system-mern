// client/src/user-pages/manager/tasks/TaskTab.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import AssignTaskModal from "./AssignTaskModal";
import { AuthContext } from "../../../context/AuthContext";
import Swal from "sweetalert2";
import { ThemeContext } from "../../../context/ThemeContext";
import {
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiXCircle,
  FiEye,
  FiPlus,
  FiTrash2,
  FiEdit,
} from "react-icons/fi";

/**
 * TaskTab Component
 * Purpose: Centralized management dashboard for Managers to oversee, edit, and delete team tasks.
 * Includes status monitoring and submission review.
 */
export default function TaskTab() {
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 25, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false); // Modal state
  const [query, setQuery] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  /* ================= FETCHING LOGIC ================= */
  /**
   * Fetches tasks based on search query and pagination
   */
  const fetchTasks = async (params = {}) => {
    setLoading(true);
    try {
      const res = await api.get("/manager/tasks", {
        params: { page: 1, limit: 100, search: query, ...params },
      });
      setTasks(res.data.data || []);
      setMeta(res.data.meta || {});
    } catch (err) {
      console.error("fetch tasks error:", err);
      Swal.fire("Error", err.response?.data?.msg || "Failed to load tasks", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreated = () => fetchTasks();

  /* ================= ACTION HANDLERS ================= */
  /**
   * Triggers a confirmation dialog before deleting a task
   */
  const handleDelete = async (taskId) => {
    const result = await Swal.fire({
      title: "Confirm Deletion?",
      text: "Permanent removal of this task and all related logs.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete Task",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/manager/tasks/${taskId}`);
      Swal.fire("Deleted", "Task record removed successfully.", "success");
      fetchTasks();
    } catch (err) {
      Swal.fire("Error", "Action failed. Please try again.", "error");
    }
  };

  /* ================= THEME UI MAPPING ================= */
  const STATUS_MAP = {
    Completed: {
      label: "Completed",
      icon: <FiCheckCircle />,
      badge: isDark ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-green-100 text-green-700 border-green-200",
      accent: "border-emerald-500",
    },
    "In Progress": {
      label: "In Progress",
      icon: <FiClock />,
      badge: isDark ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-blue-100 text-blue-700 border-blue-200",
      accent: "border-blue-500",
    },
    Pending: {
      label: "Pending",
      icon: <FiClock />,
      badge: isDark ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-amber-100 text-amber-700 border-amber-200",
      accent: "border-amber-500",
    },
    Blocked: {
      label: "Blocked",
      icon: <FiXCircle />,
      badge: isDark ? "bg-rose-500/20 text-rose-400 border-rose-500/30" : "bg-red-100 text-red-700 border-red-200",
      accent: "border-red-500",
    },
    Other: {
      label: "Other",
      icon: <FiAlertCircle />,
      badge: "bg-slate-100 text-slate-700",
      accent: "border-slate-400",
    },
  };

  // --- Theme Classes ---
  const pageBg = isDark ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-900";
  const cardBg = isDark ? "bg-slate-900/50 backdrop-blur-md border border-slate-800" : "bg-white shadow-sm border border-slate-200";

  return (
    <div className={`p-4 md:p-8 h-full overflow-auto transition-colors duration-300 ${pageBg}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black tracking-tight uppercase">Task Inventory</h2>
            <p className="text-sm opacity-60">Manage assignments, track progress, and review submissions.</p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            <FiPlus size={18} /> New Assignment
          </button>
        </div>

        {/* --- TABLE CONTAINER --- */}
        <div className={`${cardBg} rounded-3xl overflow-hidden shadow-2xl transition-all`}>
          {loading && tasks.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-bold opacity-60">Syncing Tasks...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className={`${isDark ? "bg-slate-800/80" : "bg-slate-100/80"} text-[10px] font-black uppercase tracking-widest opacity-60`}>
                  <tr>
                    <th className="p-5">Task Info</th>
                    <th className="p-5">Team Assigned</th>
                    <th className="p-5">Timeline</th>
                    <th className="p-5 text-center">Priority</th>
                    <th className="p-5">Status</th>
                    <th className="p-5">Submission</th>
                    <th className="p-5 text-right">Control</th>
                  </tr>
                </thead>

                <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-100"}`}>
                  {tasks.map((t) => {
                    const ui = STATUS_MAP[t.status] || STATUS_MAP.Other;
                    const latestSubmission = t.submissions?.[t.submissions.length - 1];

                    return (
                      <tr key={t._id} className={`group hover:bg-blue-500/5 transition-colors border-l-4 ${ui.accent}`}>
                        <td className="p-5 min-w-[200px]">
                          <div className="font-bold text-sm leading-tight group-hover:text-blue-500 transition-colors">
                            {t.title}
                          </div>
                          <div className="text-[10px] opacity-50 mt-1 truncate max-w-xs">{t.description || "No description provided."}</div>
                        </td>

                        <td className="p-5">
                          <div className="flex flex-wrap gap-1">
                            {t.assignedTo?.map((a) => (
                              <span key={a.employeeId} className={`px-2 py-0.5 rounded text-[10px] font-bold ${isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600"}`}>
                                {a.name}
                              </span>
                            )) || "Unassigned"}
                          </div>
                        </td>

                        <td className="p-5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-bold text-xs opacity-80">
                            <FiClock className="opacity-40" />
                            {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "Open Ended"}
                          </div>
                        </td>

                        <td className="p-5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                            t.priority === 'High' ? 'text-red-500' : t.priority === 'Medium' ? 'text-amber-500' : 'text-blue-500'
                          }`}>
                            {t.priority}
                          </span>
                        </td>

                        <td className="p-5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 w-25 rounded-lg border text-[10px] font-black uppercase tracking-tighter ${ui.badge}`}>
                            {ui.icon} {ui.label}
                          </span>
                        </td>

                        <td className="p-5">
                          {latestSubmission ? (
                            <a
                              href={`${API_BASE}${latestSubmission.filePath}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
                            >
                              <FiEye /> Review
                            </a>
                          ) : (
                            <span className="text-[10px] font-bold uppercase opacity-30">Awaiting...</span>
                          )}
                        </td>

                        <td className="p-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => navigate(`/manager/tasks/${t._id}/edit`)}
                              className="p-2 rounded-xl border border-slate-500/20 hover:bg-slate-500/10 text-slate-500 transition-all"
                              title="Modify Task"
                            >
                              <FiEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(t._id)}
                              className="p-2 rounded-xl border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 transition-all"
                              title="Remove Task"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {tasks.length === 0 && !loading && (
                    <tr>
                      <td colSpan="7" className="p-20 text-center opacity-40 italic">
                        No active tasks found in the ledger.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* --- MODAL --- */}
        <AssignTaskModal
          open={open}
          onClose={() => setOpen(false)}
          onCreated={handleCreated}
        />
      </div>
    </div>
  );
}