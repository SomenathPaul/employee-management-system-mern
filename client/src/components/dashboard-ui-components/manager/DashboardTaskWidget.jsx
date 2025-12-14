import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import { ThemeContext } from "../../../context/ThemeContext";
import { FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";

export default function DashboardTaskWidget() {
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---------- FETCH SHORT TASK LIST ----------
  useEffect(() => {
    let cancelled = false;

    async function fetchTasks() {
      try {
        setLoading(true);
        const res = await api.get("/manager/tasks", {
          params: { page: 1, limit: 5 },
        });

        if (!cancelled) setTasks(res.data.data || []);
      } catch (err) {
        console.error("dashboard task fetch error", err);
        if (!cancelled) setTasks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTasks();
    return () => (cancelled = true);
  }, []);

  // ---------- STATUS UI ----------
  const STATUS_UI = {
    Completed: {
      icon: <FiCheckCircle />,
      cls: "bg-green-100 text-green-800",
    },
    "In Progress": {
      icon: <FiClock />,
      cls: "bg-yellow-100 text-yellow-800",
    },
    Pending: {
      icon: <FiClock />,
      cls: "bg-gray-100 text-gray-800",
    },
    Blocked: {
      icon: <FiXCircle />,
      cls: "bg-red-100 text-red-800",
    },
  };

  const cardBg = isDark ? "bg-slate-800 text-gray-200" : "bg-white text-gray-900";
  const muted = isDark ? "text-gray-400" : "text-gray-500";

  return (
    <div className={`p-4 rounded shadow ${cardBg}`}>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Tasks</h3>
        <button
          onClick={() => navigate("/manager/tasks")}
          className="text-xs text-blue-600 hover:underline"
        >
          View all
        </button>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className={muted}>Loading tasks…</div>
      ) : tasks.length === 0 ? (
        <div className={muted}>No tasks assigned.</div>
      ) : (
        <div className="space-y-3">
          {tasks.map((t) => {
            const ui = STATUS_UI[t.status] || STATUS_UI.Pending;

            return (
              <div
                key={t._id}
                className={`flex items-center justify-between p-2 rounded ${
                  isDark ? "bg-slate-700/50" : "bg-gray-50"
                }`}
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {t.title}
                  </div>
                  <div className={`text-xs ${muted}`}>
                    Due:{" "}
                    {t.dueDate
                      ? new Date(t.dueDate).toLocaleDateString()
                      : "—"}
                  </div>
                </div>

                <div
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded ${ui.cls}`}
                >
                  {ui.icon}
                  <span>{t.status || "Pending"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
