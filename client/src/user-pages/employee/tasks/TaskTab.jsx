// client/src/user-pages/employee/tasks/TaskTab.jsx
import React, { useEffect, useState, useContext } from "react";
import api from "../../../utils/api";
import { AuthContext } from "../../../context/AuthContext";
import { ThemeContext } from "../../../context/ThemeContext";
import Swal from "sweetalert2";

export default function TaskTab() {
  const { user } = useContext(AuthContext);
  const { isDark } = useContext(ThemeContext);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({}); // { [taskId]: true }

  const fetchMyTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/manager/tasks/employee/me"); // route exposed
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setTasks(list);
    } catch (err) {
      console.error("fetch my tasks error:", err);
      setTasks([]);
      Swal.fire(
        "Error",
        err.response?.data?.msg || "Unable to fetch tasks",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  // centralised status change handler with confirmations and UI feedback
  const changeMyTaskStatus = async (id, newStatus, options = {}) => {
    const { requireConfirm = false, confirmText = "" } = options;

    if (requireConfirm) {
      const ok = await Swal.fire({
        title: `Confirm ${newStatus}?`,
        text:
          confirmText ||
          `Are you sure you want to mark this task as "${newStatus}"?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: newStatus,
      });
      if (!ok.isConfirmed) return;
    }

    setActionLoading((s) => ({ ...s, [id]: true }));

    try {
      const res = await api.patch(`/manager/tasks/${id}/status`, {
        status: newStatus,
      });

      // Try to read updated task from response
      const updated =
        res.data && (res.data.updatedTask || res.data.task || res.data);
      if (updated && (updated._id || updated.id)) {
        setTasks((prev) =>
          prev.map((t) =>
            t._id === id || t.id === id ? { ...t, ...updated } : t
          )
        );
      } else {
        // fallback: refetch
        await fetchMyTasks();
      }

      Swal.fire("Updated", `Task marked ${newStatus}`, "success");
    } catch (err) {
      console.error("changeMyTaskStatus error:", err);
      const msg =
        err.response?.data?.msg ||
        err.response?.data?.error ||
        "Failed to update task status";
      Swal.fire("Error", msg, "error");
    } finally {
      setActionLoading((s) => ({ ...s, [id]: false }));
    }
  };

  // theme classes
  const pageBg = isDark
    ? "bg-slate-900 text-gray-200"
    : "bg-gray-50 text-gray-900";
  const cardBg = isDark
    ? "bg-slate-800 border border-slate-700"
    : "bg-white border border-gray-100";
  const subtleText = isDark ? "text-gray-300" : "text-gray-600";
  const labelText = isDark ? "text-gray-100" : "text-gray-900";

  const statusStyles = {
    Completed: {
      badge: isDark
        ? "bg-green-900/30 text-green-300"
        : "bg-green-100 text-green-800",
      row: isDark ? "ring-1 ring-green-700/30" : "",
    },
    "In Progress": {
      badge: isDark
        ? "bg-yellow-900/25 text-yellow-300"
        : "bg-yellow-100 text-yellow-800",
      row: isDark ? "ring-1 ring-yellow-700/20" : "",
    },
    Pending: {
      badge: isDark
        ? "bg-slate-700/40 text-gray-200"
        : "bg-gray-100 text-gray-800",
      row: "",
    },
    Blocked: {
      badge: isDark ? "bg-red-900/25 text-red-300" : "bg-red-100 text-red-800",
      row: isDark ? "ring-1 ring-red-700/20" : "",
    },
    Other: {
      badge: isDark
        ? "bg-slate-700/30 text-gray-200"
        : "bg-gray-100 text-gray-800",
      row: "",
    },
  };

  if (loading)
    return (
      <div className={`p-6 min-h-screen ${pageBg}`}>
        <div className="max-w-6xl mx-auto">
          <div className={subtleText}>Loading tasks...</div>
        </div>
      </div>
    );

  return (
    <div className={`p-6 min-h-full ${pageBg}`}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">My Tasks</h2>

        {tasks.length === 0 ? (
          <div className={`${cardBg} rounded p-4`}>
            <div className={subtleText}>No tasks assigned.</div>
          </div>
        ) : (
          // responsive grid: 1 col sm, 2 col md, 3 col lg
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((t) => {
              const tid = t._id || t.id;
              const isBusy = !!actionLoading[tid];
              const statusRaw = String(t.status || "Pending");
              const statusKey = statusStyles[statusRaw] ? statusRaw : "Other";
              const status = statusStyles[statusKey];

              return (
                <article
                  key={tid}
                  className={`${cardBg} rounded-lg p-4 flex flex-col justify-between gap-3 ${status.row}`}
                >
                  <header>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3
                          className="text-lg font-medium"
                          style={{ color: isDark ? undefined : undefined }}
                        >
                          {t.title}
                        </h3>
                        <div
                          className="text-xs mt-1"
                          style={{ color: isDark ? undefined : undefined }}
                        >
                          <span className={subtleText}>Due:</span>{" "}
                          <span className={labelText}>
                            {t.dueDate
                              ? new Date(t.dueDate).toLocaleDateString()
                              : "—"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${status.badge}`}
                        >
                          {statusKey}
                        </span>
                      </div>
                    </div>
                  </header>

                  <div className="flex-1">
                    <p
                      className="text-sm mt-2"
                      style={{ color: isDark ? undefined : undefined }}
                    >
                      {t.description || "No description provided."}
                    </p>

                    <div className="mt-3 text-xs">
                      <div className={subtleText}>Assignees:</div>
                      {Array.isArray(t.assignedTo) &&
                      t.assignedTo.length > 0 ? (
                        <ul className="mt-1 space-y-1">
                          {t.assignedTo.map((a) => (
                            <li key={a.employeeId} className="text-sm">
                              <span className={labelText}>{a.name || "—"}</span>{" "}
                              <span className="text-xs text-gray-400">
                                • {a.employeeId}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-sm mt-1 text-gray-400">
                          No assignees
                        </div>
                      )}
                    </div>
                  </div>

                  <footer className="flex items-center justify-between gap-3 mt-3">
                    <div className="text-xs text-gray-400">
                      Priority:{" "}
                      <span className={labelText}>
                        {t.priority || "Medium"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Start */}
                      {statusKey === "Pending" && (
                        <button
                          onClick={() => changeMyTaskStatus(tid, "In Progress")}
                          disabled={isBusy}
                          className={`px-3 py-1 rounded text-sm ${
                            isBusy
                              ? "bg-yellow-200 text-yellow-800/60 cursor-not-allowed"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {isBusy ? "Working..." : "Start"}
                        </button>
                      )}

                      {/* Complete */}
                      {statusKey === "In Progress" && (
                        <button
                          onClick={() =>
                            changeMyTaskStatus(tid, "Completed", {
                              requireConfirm: true,
                              confirmText: "Mark this task as completed?",
                            })
                          }
                          disabled={isBusy}
                          className={`px-3 py-1 rounded text-sm ${
                            isBusy
                              ? "bg-green-200 text-green-800/60 cursor-not-allowed"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {isBusy ? "Saving..." : "Complete"}
                        </button>
                      )}

                      {/* If completed or others, show disabled view */}
                      {statusKey === "Completed" && (
                        <div className="px-3 py-1 rounded text-sm bg-green-500 text-white">
                          Done ✓
                        </div>
                      )}
                    </div>
                  </footer>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
