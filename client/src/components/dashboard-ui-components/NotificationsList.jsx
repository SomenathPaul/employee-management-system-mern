// client/src/components/dashboard-ui-components/NotificationsList.jsx
import React, { useEffect, useState, useContext } from "react";
import api from "../../utils/api";
import { HiMiniBellAlert } from "react-icons/hi2";
import { ThemeContext } from "../../context/ThemeContext"; // optional — safe if not provided

export default function NotificationsList() {
  const { isDark } = useContext(ThemeContext) || { isDark: false };

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      try {
        // fetch latest 5, then we'll show 2 most recent
        const res = await api.get("/notifications", { params: { page: 1, limit: 5 } });
        const list = res.data?.data || res.data || [];
        const sorted = [...list].sort((a, b) => {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return db - da;
        });
        if (!cancelled) setNotes(sorted);
      } catch (err) {
        console.error("fetch notifications", err);
        if (!cancelled) setNotes([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => {
      cancelled = true;
    };
  }, []);

  const shown = notes.slice(0, 2); // show only 2 latest

  const containerBg = isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-gray-100 text-slate-900";
  const itemBg = isDark ? "bg-slate-700/40 hover:bg-slate-700/60" : "bg-gray-50 hover:bg-white";
  const typeStyles = (type) => {
    switch ((type || "").toLowerCase()) {
      case "announcement":
        return isDark ? "bg-blue-800 text-blue-200" : "bg-blue-50 text-blue-700";
      case "blog":
        return isDark ? "bg-green-800 text-green-200" : "bg-green-50 text-green-700";
      case "notice":
        return isDark ? "bg-amber-800 text-amber-200" : "bg-amber-50 text-amber-700";
      case "update":
        return isDark ? "bg-purple-800 text-purple-200" : "bg-purple-50 text-purple-700";
      default:
        return isDark ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div
      className={`rounded-xl shadow-sm border p-4 overflow-hidden ${containerBg}`}
      role="region"
      aria-label="Company notifications"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-md ${isDark ? "bg-slate-700/50" : "bg-blue-50"}`}>
          <HiMiniBellAlert className={`${isDark ? "text-slate-100" : "text-blue-600"} w-5 h-5`} />
        </div>
        <div className="flex-1">
          <div className={`font-semibold ${isDark ? "text-slate-100" : "text-gray-800"}`}>Company notifications</div>
          <div className="text-xs mt-0.5 text-gray-400">Latest updates & announcements</div>
        </div>
      </div>

      {loading ? (
        <div className={`py-6 text-center ${isDark ? "text-slate-300" : "text-gray-500"}`}>Loading...</div>
      ) : shown.length === 0 ? (
        <div className={`py-6 text-center text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>
          No notifications available
        </div>
      ) : (
        <ul className="space-y-3">
          {shown.map((n) => (
            <li
              key={n._id}
              /* Responsive layout:
                 - small devices: column layout (image on top, content below), readable text wrapping
                 - sm+ devices: original row layout preserved
              */
              className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg border-1 border-slate-400 ${itemBg}`}
              title={n.title}
            >
              {/* Image / avatar area */}
              <div className="flex-shrink-0 w-full sm:w-auto flex items-center justify-center">
                {n.image ? (
                  <img
                    src={`http://localhost:5000/notification_uploads/${n.image}`}
                    alt={n.title || "notification image"}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded object-cover border"
                  />
                ) : (
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded flex items-center justify-center font-semibold ${typeStyles(n.type)}`}
                  >
                    <span className="text-sm">
                      {(n.title || "N").split(" ").map(s => s[0]).slice(0,2).join("")}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                  <div className="min-w-0">
                    {/* Title — allow wrapping on small screens, but truncate on larger */}
                    <h4 className={`text-sm font-medium ${isDark ? "text-slate-100" : "text-gray-900"} whitespace-normal sm:whitespace-nowrap sm:truncate`}>
                      {n.title}
                    </h4>

                    {/* Message — small devices: allow 2 lines, larger: single-line truncated */}
                    <p className={`${isDark ? "text-slate-200/90" : "text-gray-600"} mt-1 text-sm sm:text-xs whitespace-nowrap truncate`}>
                      {n.message}
                    </p>
                  </div>

                  {/* Date — on small devices show below title/message; on sm+ keep to the right */}
                  <div className="text-xs text-gray-400 mt-2 sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Bottom row: badge + read link — stacked on small, inline on larger */}
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full inline-block ${typeStyles(n.type)}`} aria-hidden>
                    {n.type || "Update"}
                  </span>

                  <div className="mt-1 sm:mt-0 sm:ml-auto">
                    <a
                      href={`/notifications/${n._id}`}
                      className={`text-xs font-medium underline ${isDark ? "text-slate-100/90" : "text-gray-700/90"}`}
                    >
                      Read
                    </a>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
