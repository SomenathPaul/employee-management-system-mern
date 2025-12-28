import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import { ThemeContext } from "../../../context/ThemeContext";
import { FiCheckCircle, FiClock, FiXCircle, FiChevronRight } from "react-icons/fi";

/**
 * DashboardTaskWidget Component
 * Renders a compact overview of the most recent team tasks for the Manager Dashboard.
 */
export default function DashboardTaskWidget() {
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCHING LOGIC ---
  useEffect(() => {
    let cancelled = false;

    /**
     * Fetches the 5 most recent tasks from the manager endpoint.
     */
    async function fetchTasks() {
      try {
        setLoading(true);
        const res = await api.get("/manager/tasks", {
          params: { page: 1, limit: 5 },
        });

        // Ensure we only update state if the component is still mounted
        if (!cancelled) setTasks(res.data.data || []);
      } catch (err) {
        console.error("Dashboard task fetch error", err);
        if (!cancelled) setTasks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTasks();
    return () => (cancelled = true); // Cleanup to prevent memory leaks
  }, []);

  // --- THEME-BASED UI CONFIGURATION ---
  // Status mapping for Icons and dynamic Tailwind classes
  const STATUS_UI = {
    Completed: {
      icon: <FiCheckCircle />,
      cls: isDark ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-green-100 text-green-800 border-green-200",
      accent: "bg-emerald-500",
    },
    "In Progress": {
      icon: <FiClock />,
      cls: isDark ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-yellow-100 text-yellow-800 border-yellow-200",
      accent: "bg-amber-500",
    },
    Pending: {
      icon: <FiClock />,
      cls: isDark ? "bg-slate-700 text-slate-300 border-slate-600" : "bg-gray-100 text-gray-800 border-gray-200",
      accent: "bg-slate-400",
    },
    Blocked: {
      icon: <FiXCircle />,
      cls: isDark ? "bg-rose-500/20 text-rose-400 border-rose-500/30" : "bg-red-100 text-red-800 border-red-200",
      accent: "bg-rose-500",
    },
  };

  // Dynamic container styling
  const cardBg = isDark ? "bg-slate-800/50 backdrop-blur-md border border-slate-700 text-slate-100" : "bg-white border border-gray-100 text-slate-900 shadow-sm";
  const mutedText = isDark ? "text-slate-400" : "text-gray-500";

  return (
    <div className={`p-5 rounded-2xl transition-all duration-300 ${cardBg}`}>
      
      {/* WIDGET HEADER */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider opacity-80">Team Tasks</h3>
          <p className="text-[10px] opacity-60">Overview of active assignments</p>
        </div>
        <button
          onClick={() => navigate("/manager/tasks")}
          className="text-[10px] font-bold uppercase text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors"
        >
          View All <FiChevronRight />
        </button>
      </div>

      {/* TASK LIST CONTENT */}
      {loading ? (
        /* Skeleton Loading State */
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 w-full bg-slate-700/20 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        /* Empty State */
        <div className={`py-10 text-center flex flex-col items-center opacity-60`}>
          <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-full mb-2">📋</div>
          <p className="text-xs font-medium">No tasks assigned yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((t) => {
            const ui = STATUS_UI[t.status] || STATUS_UI.Pending;

            return (
              <div
                key={t._id}
                className={`group flex items-center justify-between p-3 rounded-xl border border-transparent transition-all duration-200 
                  ${isDark ? "bg-slate-900/40 hover:bg-slate-900/60" : "bg-gray-50 hover:bg-gray-100 hover:border-gray-200"}`}
              >
                {/* Task Info Area */}
                <div className="min-w-0 flex items-center gap-3">
                  {/* Semantic Color Indicator */}
                  <div className={`w-1 h-8 rounded-full ${ui.accent}`} />
                  
                  <div className="min-w-0">
                    <div className="text-sm font-bold truncate group-hover:text-blue-500 transition-colors">
                      {t.title}
                    </div>
                    <div className={`text-[10px] font-medium flex items-center gap-1 ${mutedText}`}>
                      <FiClock size={10} />
                      Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "No Deadline"}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div
                  className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-black uppercase tracking-tighter rounded-lg border ${ui.cls}`}
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