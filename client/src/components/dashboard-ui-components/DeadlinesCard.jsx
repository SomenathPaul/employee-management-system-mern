// client/src/components/dashboard-ui-components/DeadlinesCard.jsx
import React, { useEffect, useState, useContext } from "react";
import api from "../../utils/api";
import { ThemeContext } from "../../context/ThemeContext";
import { Link, useNavigate } from "react-router-dom";

export default function DeadlinesCard({ maxItems = 3 }) {
  const { isDark } = useContext(ThemeContext) || { isDark: false };
  const navigate = useNavigate();

  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        // expected: /manager/tasks/employee/me returns array or { data: [...] }
        const res = await api.get("/manager/tasks/employee/me");
        const tasks = Array.isArray(res.data) ? res.data : res.data?.data || [];

        const now = new Date();
        // filter upcoming within next 7 days OR overdue tasks
        const windowEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const filtered = tasks
          .filter((t) => t.dueDate) // ignore tasks without due date
          .map((t) => ({ ...t, dueTs: new Date(t.dueDate).getTime() }))
          .filter((t) => !isNaN(t.dueTs)) // valid date
          .filter((t) => t.dueTs >= now.getTime() - 0) // include today and future (and you can change to include overdue)
          .sort((a, b) => a.dueTs - b.dueTs);

        // find tasks within next 7 days; if none, show nearest upcoming / overdue
        let next = filtered.filter((t) => t.dueTs <= windowEnd.getTime());
        if (next.length === 0) {
          // fallback: nearest 3 tasks from filtered (could be overdue)
          next = filtered.slice(0, maxItems);
        } else {
          next = next.slice(0, maxItems);
        }

        if (!cancelled) setUpcoming(next);
      } catch (err) {
        console.error("deadlines fetch", err);
        if (!cancelled) {
          setUpcoming([]);
          setError(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => {
      cancelled = true;
    };
  }, [maxItems]);

  const containerCls = isDark
    ? "bg-slate-800 border border-slate-700 text-slate-100"
    : "bg-white border border-gray-100 text-slate-900";
  const muted = isDark ? "text-slate-300" : "text-gray-500";

  return (
    <div className={`rounded-xl shadow-sm p-4 overflow-hidden ${containerCls}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold">Upcoming Deadlines</h3>
          <div className="text-xs mt-1" style={{ color: isDark ? "#9CA3AF" : "#6B7280" }}>
            Next 7 days — max {maxItems}
          </div>
        </div>
      </div>

      {loading ? (
        <div className={`py-6 text-center ${muted}`}>Loading deadlines…</div>
      ) : error ? (
        <div className="py-6 text-center text-sm text-red-400">
          Error loading deadlines.
        </div>
      ) : upcoming.length === 0 ? (
        <div className={`py-6 text-center text-sm ${muted}`}>
          No upcoming deadlines. Check the tasks page for all tasks.
        </div>
      ) : (
        <ul className="space-y-3">
          {upcoming.map((t) => {
            const due = new Date(t.dueDate);
            const daysLeft = Math.ceil((due.getTime() - Date.now()) / (24 * 3600 * 1000));
            const isOverdue = daysLeft < 0;
            const badgeCls = isOverdue
              ? "bg-red-100 text-red-700"
              : daysLeft <= 1
              ? "bg-amber-100 text-amber-800"
              : "bg-green-100 text-green-800";

            return (
              <li
                key={t._id}
                className={`p-3 rounded-lg border ${isDark ? "border-slate-700" : "border-gray-100"} flex items-center justify-between gap-4 hover:shadow-md transition`}
                title="Click to open task"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-sm truncate">{t.title || "Untitled task"}</div>
                    <div className="text-xs text-gray-400">•</div>
                    <div className="text-xs" style={{ color: isDark ? "#9CA3AF" : "#6B7280" }}>
                      {t.assignedTo?.map(a => a.name).slice(0,2).join(", ") || "—"}
                    </div>
                  </div>
                  <div className="text-xs mt-1 truncate" style={{ color: isDark ? "#94A3B8" : "#6B7280" }}>
                    {t.description ? (t.description.length > 120 ? t.description.slice(0, 117) + "..." : t.description) : <span className="text-gray-400">No description</span>}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className={`text-xs px-2 py-0.5 rounded-full ${badgeCls}`}>
                    {isOverdue ? `Overdue ${Math.abs(daysLeft)}d` : daysLeft === 0 ? "Due today" : `In ${daysLeft}d`}
                  </div>
                  <div className="text-xs" style={{ color: isDark ? "#9CA3AF" : "#6B7280" }}>
                    {due.toLocaleDateString()}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
