// client/src/components/notifications/NotificationsTab.jsx
import React, { useEffect, useState, useContext } from "react";
import api from "../../utils/api"; // adjust path if needed
import { HiMiniBellAlert } from "react-icons/hi2";
import { ThemeContext } from "../../context/ThemeContext";

const TYPE_STYLES = {
  Announcement: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-600" },
  Blog: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-600" },
  Notice: { bg: "bg-yellow-100", text: "text-yellow-800", dot: "bg-yellow-600" },
  Update: { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-600" },
  Other: { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" },
};

function getTypeClasses(type, isDark) {
  const base = TYPE_STYLES[type] || TYPE_STYLES.Other;
  if (!isDark) return `${base.bg} ${base.text} ${base.dot}`;
  // dark overrides for the chip (keeps color hint but darker)
  const darkMap = {
    Announcement: { bg: "bg-blue-900", text: "text-blue-100", dot: "bg-blue-400" },
    Blog: { bg: "bg-green-900", text: "text-green-100", dot: "bg-green-400" },
    Notice: { bg: "bg-yellow-900", text: "text-yellow-100", dot: "bg-yellow-400" },
    Update: { bg: "bg-purple-900", text: "text-purple-100", dot: "bg-purple-400" },
    Other: { bg: "bg-slate-800", text: "text-slate-100", dot: "bg-slate-400" },
  };
  const dark = darkMap[type] || darkMap.Other;
  return `${dark.bg} ${dark.text} ${dark.dot}`;
}

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const { isDark } = useContext(ThemeContext);

  // Theme classes
  const pageBg = isDark ? "bg-app text-gray-200" : "bg-white text-gray-800";
  const panelInput = isDark
    ? "border p-2 rounded w-full md:w-64 bg-slate-800 text-gray-200 border-slate-700"
    : "border p-2 rounded w-full md:w-64 bg-white text-gray-700 border-gray-300";
  const selectInput = isDark
    ? "border p-2 rounded bg-slate-800 text-gray-200 border-slate-700"
    : "border p-2 rounded bg-white text-gray-700 border-gray-300";
  const btnPrimary = isDark ? "px-3 py-2 bg-blue-700 text-white rounded hover:bg-blue-600" : "px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700";
  const btnGhost = isDark ? "px-3 py-2 bg-slate-800 rounded hover:bg-slate-700" : "px-3 py-2 bg-gray-100 rounded hover:bg-gray-200";
  const cardBg = isDark ? "bg-slate-800 border-slate-700 text-gray-200" : "bg-white border-gray-100 text-gray-800";
  const cardFooterBg = isDark ? "bg-slate-900 border-t border-slate-700" : "bg-gray-50 border-t border-gray-100";
  const headingText = isDark ? "text-gray-100" : "text-gray-800";
  const subText = isDark ? "text-gray-400" : "text-gray-500";

  const fetchList = async (params = {}) => {
    setLoading(true);
    try {
      // public endpoint for notifications
      const res = await api.get("/notifications", {
        params: { page: 1, limit: 50, ...params },
      });
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error("fetch notifications:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = () => {
    fetchList({ search: query, type: typeFilter });
  };

  const clear = () => {
    setQuery("");
    setTypeFilter("");
    fetchList();
  };

  return (
    <div className={`h-full shadow-md p-6 overflow-y-auto ${pageBg}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-5">
        <div className="flex items-center gap-3">
          <HiMiniBellAlert className="text-blue-500 w-6 h-6" />
          <div>
            <h2 className={`text-xl font-semibold ${headingText}`}>Company Notifications</h2>
            <div className={`text-sm ${subText}`}>Latest announcements, updates and posts from your company.</div>
          </div>
        </div>

        <div className="ml-auto w-full md:w-auto flex flex-col md:flex-row gap-2 items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title or message"
            className={panelInput + " md:w-64"}
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={selectInput}
          >
            <option value="">All types</option>
            <option value="Announcement">Announcement</option>
            <option value="Blog">Blog</option>
            <option value="Notice">Notice</option>
            <option value="Update">Update</option>
          </select>

          <button onClick={onSearch} className={btnPrimary}>Search</button>

          <button onClick={clear} className={btnGhost}>Clear</button>
        </div>
      </div>

      {/* Grid of notification cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`${cardBg} p-4 border rounded-lg animate-pulse h-40`} />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className={`flex items-center justify-center h-56 ${subText}`}>
          No notifications to display
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notifications.map((note) => {
            const type = note.type || "Other";
            // type chip classes combined for bg/text/dot
            const typeChip = getTypeClasses(type, isDark).split(" ");
            const chipBg = typeChip[0];
            const chipText = typeChip[1];
            const chipDot = typeChip[2];

            return (
              <article
                key={note._id}
                className={`${cardBg} border rounded-lg shadow-sm hover:shadow-md transition overflow-hidden flex flex-col`}
                aria-labelledby={`note-${note._id}`}
              >
                <div className="flex gap-4 p-4">
                  <div className="w-28 h-20 rounded overflow-hidden flex-shrink-0 bg-gray-50 border">
                    {note.image ? (
                      <img
                        src={`http://localhost:5000/notification_uploads/${note.image}`}
                        alt={note.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3 id={`note-${note._id}`} className="font-semibold text-lg truncate">
                        {note.title}
                      </h3>

                      <div className={`px-2 py-1 text-xs font-medium rounded-full ${chipBg} ${chipText}`}>
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${chipDot}`} />
                        {type}
                      </div>
                    </div>

                    <p className={`text-sm mt-2 ${isDark ? "text-gray-300" : "text-gray-600"} line-clamp-3 whitespace-pre-wrap`}>
                      {note.message}
                    </p>

                    <div className="mt-3 text-xs flex justify-between items-center">
                      <div className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>{new Date(note.createdAt).toLocaleString()}</div>
                      <div className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>By: {note.createdByName || "Admin"}</div>
                    </div>
                  </div>
                </div>

                <div className={`${cardFooterBg} p-3 flex items-center justify-between`}>
                  <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>ID: {note._id}</div>
                  <div className="flex gap-2">
                    <a
                      href={`/manager/notifications/${note._id}`}
                      className={`px-3 py-1 rounded text-sm border ${isDark ? "bg-slate-800 border-slate-700 hover:bg-slate-700" : "bg-white border-gray-200 hover:bg-gray-100"}`}
                    >
                      View
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
