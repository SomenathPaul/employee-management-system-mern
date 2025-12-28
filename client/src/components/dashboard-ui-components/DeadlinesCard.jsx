// client/src/components/dashboard-ui-components/DeadlinesCard.jsx
import React, { useEffect, useState, useContext } from "react";
import api from "../../utils/api";
import { ThemeContext } from "../../context/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import { FiClock, FiAlertCircle, FiChevronRight } from "react-icons/fi";

/**
 * DeadlinesCard
 * Displays a prioritized list of overdue and upcoming task deadlines.
 */
export default function DeadlinesCard({ maxItems = 3 }) {
  const { isDark } = useContext(ThemeContext) || { isDark: false };
  const navigate = useNavigate();

  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchDeadlines = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch tasks specifically assigned to the current user
        const res = await api.get("/manager/tasks/employee/me");
        const tasks = Array.isArray(res.data) ? res.data : res.data?.data || [];

        const now = new Date();
        const todayMs = now.setHours(0, 0, 0, 0); // Normalize today to midnight for clean day-diffs
        const windowEnd = todayMs + 7 * 24 * 60 * 60 * 1000;

        const processed = tasks
          .filter((t) => t.dueDate && t.status !== "Completed") // Only active tasks with dates
          .map((t) => {
            const due = new Date(t.dueDate);
            return {
              ...t,
              dueTs: due.setHours(0, 0, 0, 0),
              daysLeft: Math.ceil((due.getTime() - todayMs) / (24 * 3600 * 1000)),
            };
          })
          .filter((t) => !isNaN(t.dueTs))
          // Sort logic: Overdue first, then by nearest date
          .sort((a, b) => a.dueTs - b.dueTs);

        // Prioritize: 1. Overdue, 2. Due within 7 days, 3. Anything else nearest
        const finalSelection = processed.slice(0, maxItems);

        if (!cancelled) setUpcoming(finalSelection);
      } catch (err) {
        console.error("Deadlines fetch error:", err);
        if (!cancelled) {
          setUpcoming([]);
          setError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDeadlines();
    return () => { cancelled = true; };
  }, [maxItems]);

  // --- Dynamic Styling ---
  const containerBg = isDark
    ? "bg-slate-800/50 backdrop-blur-md border-slate-700 text-slate-100"
    : "bg-white border-gray-100 text-slate-900 shadow-sm";

  const getStatusStyles = (daysLeft) => {
    if (daysLeft < 0) return isDark ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-red-50 text-red-600 border-red-100";
    if (daysLeft <= 1) return isDark ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-amber-50 text-amber-700 border-amber-100";
    return isDark ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-emerald-50 text-emerald-600 border-emerald-100";
  };

  return (
    <div className={`rounded-2xl p-5 transition-all duration-300 border ${containerBg}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isDark ? "bg-amber-500/10" : "bg-amber-50"}`}>
            <FiClock className={isDark ? "text-amber-400" : "text-amber-600"} size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight">Deadlines</h3>
            <p className="text-[11px] opacity-60">Critical project timelines</p>
          </div>
        </div>
      </div>

      {/* Content States */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-16 w-full animate-pulse rounded-xl ${isDark ? "bg-slate-700/50" : "bg-gray-100"}`} />
          ))}
        </div>
      ) : error ? (
        <div className="py-8 text-center">
          <FiAlertCircle className="mx-auto mb-2 text-red-400" size={24} />
          <p className="text-xs opacity-60">Unable to sync deadlines</p>
        </div>
      ) : upcoming.length === 0 ? (
        <div className="py-10 text-center flex flex-col items-center">
          <div className="text-3xl mb-2">🎉</div>
          <p className="text-xs font-medium opacity-60 italic">No pressing deadlines. Great job!</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {upcoming.map((task) => (
            <li
              key={task._id}
              onClick={() => navigate(`/employee/tasks`)}
              className={`group flex items-center justify-between gap-4 p-3 rounded-xl border cursor-pointer transition-all duration-200 
                ${isDark ? "border-slate-700/50 hover:bg-slate-700/30" : "border-gray-50 hover:bg-gray-50"}`}
            >
              {/* Task Title & Meta */}
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold truncate group-hover:text-blue-500 transition-colors">
                  {task.title}
                </h4>
                <div className="flex items-center gap-2 mt-1 opacity-60">
                  <span className="text-[10px] font-medium uppercase tracking-tight">
                    {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-xs">•</span>
                  <span className="text-[10px] truncate max-w-[100px]">
                    {task.assignedTo?.[0]?.name || "Unassigned"}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border whitespace-nowrap ${getStatusStyles(task.daysLeft)}`}>
                  {task.daysLeft < 0 
                    ? `Overdue ${Math.abs(task.daysLeft)}d` 
                    : task.daysLeft === 0 
                      ? "Today" 
                      : `${task.daysLeft}d left`}
                </div>
                <FiChevronRight className="opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all text-blue-500" size={16} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}