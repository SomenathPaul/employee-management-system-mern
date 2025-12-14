// client/src/user-pages/manager/tasks/TaskTab.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import AssignTaskModal from "./AssignTaskModal";
import { AuthContext } from "../../../context/AuthContext";
import Swal from "sweetalert2";
import { ThemeContext } from "../../../context/ThemeContext";
import { FiCheckCircle, FiClock, FiAlertCircle, FiXCircle } from "react-icons/fi";
import { TbCpu } from "react-icons/tb";

export default function TaskTab() {
  const { user } = useContext(AuthContext);
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 25, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const fetchTasks = async (params = {}) => {
    setLoading(true);
    try {
      const res = await api.get("/manager/tasks", {
        params: { page: 1, limit: 100, search: query, ...params },
      });
      setTasks(res.data.data || []);
      setMeta(res.data.meta || {});
    } catch (err) {
      console.error("fetch tasks:", err);
      setTasks([]);
      Swal.fire("Error", err.response?.data?.msg || "Failed to load tasks", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreated = (task) => {
    fetchTasks();
  };

  const handleDelete = async (taskId) => {
    const result = await Swal.fire({
      title: "Delete task?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#d33",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/manager/tasks/${taskId}`);
      await Swal.fire({ title: "Deleted", text: "Task deleted.", icon: "success", timer: 1200, showConfirmButton: false });
      fetchTasks();
    } catch (err) {
      console.error("delete task error", err);
      Swal.fire("Error", err.response?.data?.msg || "Failed to delete task", "error");
    }
  };

  // Status mapping for badge text, icon and colors
  const STATUS_MAP = {
    "Completed": {
      label: "Completed",
      icon: <FiCheckCircle />,
      badge: "bg-green-100 text-green-800",
      row: isDark ? "bg-green-900/20" : "bg-green-50",
    },
    "In Progress": {
      label: "In Progress",
      icon: <FiClock />,
      badge: "bg-yellow-100 text-yellow-800",
      row: isDark ? "bg-yellow-900/15" : "bg-yellow-50",
    },
    "Pending": {
      label: "Pending",
      icon: <FiClock />,
      badge: "bg-gray-100 text-gray-800",
      row: isDark ? "bg-slate-700/20" : "bg-white",
    },
    "Blocked": {
      label: "Blocked",
      icon: <FiXCircle />,
      badge: "bg-red-100 text-red-800",
      row: isDark ? "bg-red-900/15" : "bg-red-50",
    },
    "Computer": {
      label: "Computer",
      icon: <TbCpu />,
      badge: "bg-indigo-100 text-indigo-800",
      row: isDark ? "bg-indigo-900/12" : "bg-indigo-50",
    },
    "Other": {
      label: "Other",
      icon: <FiAlertCircle />,
      badge: "bg-gray-100 text-gray-800",
      row: isDark ? "bg-slate-700/10" : "bg-white",
    },
  };

  const containerBg = isDark ? "bg-slate-900 text-gray-200" : "bg-gray-50 text-gray-900";
  const panelBg = isDark ? "bg-slate-800 border border-slate-700 text-gray-200" : "bg-white border border-gray-100";
  const inputBase = isDark
    ? "border p-2 rounded bg-slate-700 border-slate-600 text-gray-100"
    : "border p-2 rounded bg-white border-gray-300 text-gray-900";
  const btnPrimary = isDark
    ? "px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
    : "px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700";
  const btnSecondary = isDark
    ? "px-3 py-2 bg-slate-700 text-gray-100 rounded hover:bg-slate-600"
    : "px-3 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300";

  return (
    <div className={`p-6 min-h-full ${containerBg}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
          <h2 className="text-xl font-semibold">Task Management</h2>

          <div className="flex gap-2 items-center w-full md:w-auto">
            <input
              placeholder="Search title/employee"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`${inputBase} flex-1 md:flex-none`}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchTasks();
              }}
            />
            <button onClick={() => fetchTasks()} className={`${btnSecondary} ml-0 md:ml-2`}>
              Search
            </button>
            <button onClick={() => setOpen(true)} className={`${btnPrimary} ml-auto md:ml-2`}>
              Assign Task
            </button>
          </div>
        </div>

        <div className={`${panelBg} rounded shadow p-4`}>
          {loading ? (
            <div className={isDark ? "text-gray-300" : "text-gray-600"}>Loading...</div>
          ) : (
            <div className="overflow-auto max-h-[60vh]">
              <table className="w-full text-sm">
                <thead className={`${isDark ? "bg-slate-800" : "bg-gray-50"} sticky top-0`}>
                  <tr>
                    <th className="p-2 text-left w-12">#</th>
                    <th className="p-2 text-left">Title</th>
                    <th className="p-2 text-left">Assignees</th>
                    <th className="p-2 text-left">Due</th>
                    <th className="p-2 text-left">Priority</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {tasks.map((t, idx) => {
                    const statusKey = (t.status || "Other");
                    const map = STATUS_MAP[statusKey] || STATUS_MAP["Other"];
                    return (
                      <tr
                        key={t._id}
                        className={`border-b transition-all ${map.row}`}
                      >
                        <td className="p-2 align-top">{idx + 1}</td>

                        <td className="p-2 font-medium align-top">{t.title}</td>

                        <td className="p-2 align-top">
                          {Array.isArray(t.assignedTo) && t.assignedTo.length > 0 ? (
                            t.assignedTo.map((a) => (
                              <div key={a.employeeId} className="text-xs">
                                {a.name || "—"} <span className="text-gray-400">• {a.employeeId}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-gray-400">No assignees</div>
                          )}
                        </td>

                        <td className="p-2 align-top">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}</td>

                        <td className="p-2 align-top">{t.priority}</td>

                        <td className="p-2 align-top">
                          <div className={`inline-flex items-center gap-2 px-2 py-1 text-xs font-medium rounded ${map.badge}`}>
                            <span className="text-sm">{map.icon}</span>
                            <span>{map.label}</span>
                          </div>
                        </td>

                        <td className="p-2 align-top">
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/manager/tasks/${t._id}/edit`)}
                              className={isDark ? "px-2 py-1 text-xs bg-slate-700 text-gray-100 rounded hover:bg-slate-600" : "px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"}
                            >
                              View / Edit
                            </button>

                            <button
                              onClick={() => handleDelete(t._id)}
                              className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {tasks.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-4 text-center text-gray-500">No tasks.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <AssignTaskModal open={open} onClose={() => setOpen(false)} onCreated={handleCreated} />
      </div>
    </div>
  );
}
