// client/src/components/notifications/NotificationsTab.jsx
import React, { useEffect, useState, useContext } from "react";
import api from "../../utils/api";
import { HiMiniBellAlert } from "react-icons/hi2";
import { ThemeContext } from "../../context/ThemeContext";
import { NotificationContext } from "../../context/NotificationContext";
import { FiEye, FiX, FiSearch } from "react-icons/fi";
import { GrPowerReset } from "react-icons/gr";

/**
 * Visual styles for different notification types (Light Mode)
 * Defines background, text, and border colors based on the category.
 */
const TYPE_STYLES = {
  Announcement: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  Blog: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
  },
  Notice: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    border: "border-amber-200",
  },
  Update: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  Other: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-200",
  },
};

/**
 * Returns Tailwind CSS classes for notification chips based on theme and type.
 * @param {string} type - The notification category (e.g., Announcement).
 * @param {boolean} isDark - Current theme state.
 */
function getTypeClasses(type, isDark) {
  if (!isDark) {
    const s = TYPE_STYLES[type] || TYPE_STYLES.Other;
    return `${s.bg} ${s.text} ${s.border}`;
  }
  // Dark Mode color palette using opacity-based backgrounds
  const darkMap = {
    Announcement: {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      border: "border-blue-500/20",
    },
    Blog: {
      bg: "bg-green-500/10",
      text: "text-green-400",
      border: "border-green-500/20",
    },
    Notice: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/20",
    },
    Update: {
      bg: "bg-purple-500/10",
      text: "text-purple-400",
      border: "border-purple-500/20",
    },
    Other: {
      bg: "bg-slate-700",
      text: "text-slate-300",
      border: "border-slate-600",
    },
  };
  const d = darkMap[type] || darkMap.Other;
  return `${d.bg} ${d.text} ${d.border}`;
}

export default function NotificationsTab() {
  // --- State Management ---
  const [notifications, setNotifications] = useState([]); // List of notification objects
  const [loading, setLoading] = useState(true); // Loading state for skeleton UI
  const [query, setQuery] = useState(""); // Search input text
  const [typeFilter, setTypeFilter] = useState(""); // Selected category filter
  const [viewNote, setViewNote] = useState(null); // Currently active notification for modal viewing

  // --- Context Consumption ---
  const { isDark } = useContext(ThemeContext);
  const { markAllAsRead } = useContext(NotificationContext);

  // --- Theme-Based Styling Constants ---
  const pageBg = isDark
    ? "bg-slate-900 text-slate-200"
    : "bg-gray-50 text-slate-800";
  const cardBg = isDark
    ? "bg-slate-800 border-slate-700"
    : "bg-white border-gray-200";
  const inputStyles = isDark
    ? "bg-slate-800 border-slate-700 text-slate-200 focus:ring-blue-500/50"
    : "bg-white border-gray-300 text-slate-800 focus:ring-blue-500/20";

  /**
   * Fetches notifications from the backend API.
   * @param {Object} params - Search and filter parameters.
   */
  const fetchList = async (params = {}) => {
    setLoading(true);
    try {
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

  // Initial data load and cleanup on mount
  useEffect(() => {
    fetchList();
    markAllAsRead(); // Logic to clear unread counts globally
  }, []);

  /**
   * Triggered when user clicks 'Search' button.
   */
  const onSearch = () => fetchList({ search: query, type: typeFilter });

  /**
   * Resets all search/filter states and re-fetches the original list.
   */
  const clear = () => {
    setQuery("");
    setTypeFilter("");
    fetchList();
  };

  return (
    <div
      className={`h-full p-4 md:p-8 overflow-y-auto transition-colors duration-300 ${pageBg}`}
    >
      <div className="max-w-7xl mx-auto">
        {/* --- Header & Filtering UI --- */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-2xl ${
                isDark ? "bg-blue-500/10" : "bg-blue-50"
              }`}
            >
              <HiMiniBellAlert className="text-blue-500 w-8 h-8" />
            </div>
            <div>
              <h1
                className={`text-2xl font-bold tracking-tight ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Company Notifications
              </h1>
              <p
                className={`text-sm ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Stay updated with the latest company news and announcements.
              </p>
            </div>
          </div>

          {/* Search Controls Container */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Search Input */}
            <div className="relative group">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className={`pl-10 pr-4 py-2 rounded-xl border outline-none transition-all w-full md:w-64 ${inputStyles}`}
              />
            </div>

            {/* Type Dropdown */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`px-4 py-2 rounded-xl border outline-none cursor-pointer ${inputStyles}`}
            >
              <option value="">All Types</option>
              {Object.keys(TYPE_STYLES).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* Action Buttons */}
            <button
              onClick={onSearch}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              Search
            </button>
            <button
              onClick={clear}
              className={`p-2.5 rounded-xl border transition-all ${
                isDark
                  ? "border-slate-700 hover:bg-slate-700 text-slate-400"
                  : "border-gray-200 hover:bg-gray-100 text-slate-500"
              }`}
              title="Clear Filters"
            >
              <GrPowerReset size={18} />
            </button>
          </div>
        </div>

        {/* --- Content Area --- */}
        {loading ? (
          /* Loading Skeleton State */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`${cardBg} border rounded-2xl h-64 animate-pulse`}
              />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-96 opacity-60">
            <HiMiniBellAlert size={48} className="mb-4 text-slate-300" />
            <p className="text-lg">No notifications found</p>
          </div>
        ) : (
          /* Notification Card Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {notifications.map((note) => {
              const type = note.type || "Other";
              const typeClasses = getTypeClasses(type, isDark);

              return (
                <article
                  key={note._id}
                  className={`${cardBg} border rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group`}
                >
                  <div className="p-5 flex-1">
                    {/* Badge & Date */}
                    <div className="flex justify-between items-start mb-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-[10px] uppercase font-bold border ${typeClasses}`}
                      >
                        {type}
                      </span>
                      <time className="text-[10px] font-medium text-slate-400">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </time>
                    </div>

                    {/* Content Body */}
                    <div className="flex gap-4 mb-4">
                      {note.image && (
                        <img
                          src={`http://localhost:5000/notification_uploads/${note.image}`}
                          alt=""
                          className="w-20 h-20 rounded-xl object-cover bg-slate-100 border border-slate-200/50"
                        />
                      )}
                      <div className="flex-1">
                        <h3
                          className={`font-bold text-lg mb-1 line-clamp-1 ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {note.title}
                        </h3>
                        <p
                          className={`text-sm line-clamp-3 leading-relaxed ${
                            isDark ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          {note.message}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div
                    className={`px-5 py-3 rounded-b-2xl flex items-center justify-between border-t ${
                      isDark
                        ? "bg-slate-800/50 border-slate-700"
                        : "bg-slate-50 border-gray-100"
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 font-medium">
                      By {note.createdByName || "Admin"}
                    </span>
                    <button
                      onClick={() => setViewNote(note)}
                      className="text-blue-500 hover:text-blue-600 text-sm font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <FiEye /> View Details
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* --- Detail Modal (Overlay) --- */}
      {viewNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setViewNote(null)}
          />

          <div
            className={`relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 transform ${
              isDark ? "bg-slate-900 border border-slate-700" : "bg-white"
            }`}
          >
            {/* Close Button */}
            <button
              onClick={() => setViewNote(null)}
              className="absolute right-4 top-4 z-10 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500 transition-colors"
            >
              <FiX size={20} />
            </button>

            <div className="max-h-[85vh] overflow-y-auto">
              {/* Feature Image */}
              {viewNote.image && (
                <div className="w-full h-64 md:h-80 overflow-hidden">
                  <img
                    src={`http://localhost:5000/notification_uploads/${viewNote.image}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Modal Body */}
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getTypeClasses(
                      viewNote.type || "Other",
                      isDark
                    )}`}
                  >
                    {viewNote.type}
                  </span>
                  <span className="text-sm text-slate-400">
                    {new Date(viewNote.createdAt).toLocaleString(undefined, {
                      dateStyle: "long",
                      timeStyle: "short",
                    })}
                  </span>
                </div>

                <h2
                  className={`text-3xl font-bold mb-6 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {viewNote.title}
                </h2>

                <div
                  className={`prose max-w-none mb-8 ${
                    isDark ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed text-base">
                    {viewNote.message}
                  </p>
                </div>

                {/* Meta Information / Author */}
                <div
                  className={`pt-6 border-t flex items-center justify-between ${
                    isDark ? "border-slate-800" : "border-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                      {(viewNote.createdByName || "A").charAt(0)}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-bold ${
                          isDark ? "text-slate-200" : "text-slate-800"
                        }`}
                      >
                        {viewNote.createdByName || "Administrator"}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Official Company Post
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ID: {viewNote._id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
