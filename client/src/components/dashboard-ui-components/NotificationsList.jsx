// client/src/components/dashboard-ui-components/NotificationsList.jsx
import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { HiMiniBellAlert } from "react-icons/hi2";
import { ThemeContext } from "../../context/ThemeContext";

/**
 * NotificationsList Component
 * Renders a compact, high-priority list of the latest company notifications.
 * Designed to fit into dashboard sidebars or narrow columns.
 */
export default function NotificationsList() {
  // Use a safe fallback if ThemeContext isn't available
  const { isDark } = useContext(ThemeContext) || { isDark: false };

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    
    /**
     * Fetches the 5 most recent notifications but only displays the top 2
     * to keep the dashboard view uncluttered.
     */
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await api.get("/notifications", { params: { page: 1, limit: 5 } });
        const list = res.data?.data || res.data || [];
        
        // Sorting by date descending (latest first)
        const sorted = [...list].sort((a, b) => {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return db - da;
        });

        if (!cancelled) setNotes(sorted);
      } catch (err) {
        console.error("fetch notifications error:", err);
        if (!cancelled) setNotes([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchNotifications();
    return () => { cancelled = true; };
  }, []);

  const shown = notes.slice(0, 2); // Display limit for dashboard widget

  // --- Dynamic Theme Styles ---
  const containerBg = isDark 
    ? "bg-slate-800/50 backdrop-blur-md border-slate-700 text-slate-100" 
    : "bg-white border-gray-100 text-slate-900 shadow-sm";
    
  const itemBg = isDark 
    ? "bg-slate-700/30 hover:bg-slate-700/50 border-slate-600/50" 
    : "bg-gray-50 hover:bg-white border-gray-200";

  /**
   * Returns Tailwind classes for category badges based on type and theme.
   */
  const getTypeStyles = (type) => {
    const t = (type || "").toLowerCase();
    const darkClasses = {
      announcement: "bg-blue-900/40 text-blue-300 border-blue-800",
      blog: "bg-green-900/40 text-green-300 border-green-800",
      notice: "bg-amber-900/40 text-amber-300 border-amber-800",
      update: "bg-purple-900/40 text-purple-300 border-purple-800",
      default: "bg-slate-700 text-slate-300 border-slate-600"
    };
    const lightClasses = {
      announcement: "bg-blue-50 text-blue-700 border-blue-100",
      blog: "bg-green-50 text-green-700 border-green-100",
      notice: "bg-amber-50 text-amber-700 border-amber-100",
      update: "bg-purple-50 text-purple-700 border-purple-100",
      default: "bg-gray-100 text-gray-600 border-gray-200"
    };

    const set = isDark ? darkClasses : lightClasses;
    return set[t] || set.default;
  };

  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-300 ${containerBg}`}
      role="region"
      aria-label="Company notifications"
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl transition-colors ${isDark ? "bg-blue-500/10" : "bg-blue-50"}`}>
            <HiMiniBellAlert className={`${isDark ? "text-blue-400" : "text-blue-600"} w-5 h-5`} />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight">Company Updates</h3>
            <p className="text-[11px] opacity-60">What's new in the workplace</p>
          </div>
        </div>
        <Link 
          to="/employee/notifications" 
          className="text-[11px] font-bold uppercase tracking-wider text-blue-500 hover:underline"
        >
          View All
        </Link>
      </div>

      {/* List Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className={`h-20 rounded-xl animate-pulse ${isDark ? "bg-slate-700/50" : "bg-gray-100"}`} />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-xs opacity-50 font-medium italic">No new alerts today.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {shown.map((n) => (
            <li
              key={n._id}
              className={`group relative flex flex-col sm:flex-row items-start gap-4 p-4 rounded-xl border transition-all duration-200 ${itemBg}`}
            >
              {/* Media Section: Image or Initials */}
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                {n.image ? (
                  <img
                    src={`http://localhost:5000/notification_uploads/${n.image}`}
                    alt=""
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border-2 border-white/10 shadow-sm"
                  />
                ) : (
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center font-bold border-2 ${getTypeStyles(n.type)}`}>
                    <span className="text-xs uppercase tracking-tighter">
                      {(n.title || "N").split(" ").map(s => s[0]).slice(0, 2).join("")}
                    </span>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold truncate pr-2">
                      {n.title}
                    </h4>
                    <span className="text-[10px] opacity-50 font-medium whitespace-nowrap">
                      {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  
                  <p className={`text-xs leading-relaxed line-clamp-2 ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                    {n.message}
                  </p>

                  
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}