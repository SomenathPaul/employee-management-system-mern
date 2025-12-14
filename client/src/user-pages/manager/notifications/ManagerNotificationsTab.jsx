// client/src/user-pages/manager/notifications/ManagerNotificationsTab.jsx
import React, { useEffect, useMemo, useState, useContext } from "react";
import api from "../../../utils/api";
import Swal from "sweetalert2";
import CreateNotificationModal from "./CreateNotificationModal";
import { HiMiniBellAlert } from "react-icons/hi2";
import { IoIosRemoveCircleOutline } from "react-icons/io";
import { ThemeContext } from "../../../context/ThemeContext";

const TYPE_COLORS = {
  Announcement: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  Blog: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  Notice: { bg: "bg-yellow-50", text: "text-yellow-800", dot: "bg-yellow-500" },
  Update: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  Other: { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-500" },
};

export default function ManagerNotificationsTab() {
  const { isDark } = useContext(ThemeContext);

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);

  // filters / query
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState(""); // "", Announcement, Blog, Notice, Update
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // paging (optional)
  const [page, setPage] = useState(1);
  const [limit] = useState(24);

  // Theme classes
  const pageBg = isDark ? "bg-app text-gray-200" : "bg-white text-gray-900";
  const panelBg = isDark ? "bg-slate-800/80 border-slate-700 text-gray-200" : "bg-white border-gray-100 text-gray-900";
  const inputBase = isDark
    ? "border p-2 rounded bg-slate-700 text-gray-200 border-slate-600"
    : "border p-2 rounded bg-white text-gray-800 border-gray-300";
  const selectBase = inputBase;
  const smallBtn = isDark ? "px-3 py-2 bg-slate-700 text-gray-200 rounded hover:bg-slate-600" : "px-3 py-2 bg-gray-100 rounded hover:bg-gray-200";
  const primaryBtn = isDark ? "px-4 py-2 text-white rounded shadow" : "px-4 py-2 text-white rounded shadow";
  const cardBg = isDark ? "bg-slate-800 border-slate-700 text-gray-200" : "bg-white border-gray-100 text-gray-900";
  const skeletonBg = isDark ? "animate-pulse bg-slate-700/60 h-40 rounded" : "animate-pulse bg-white h-40 rounded border";
  const badgeContainer = (t) =>
    isDark
      ? `px-2 py-1 text-xs font-medium rounded-full ${t.bg.replace("-50", "-900").replace("bg-gray-50", "bg-slate-700")} ${t.text.replace("700", "100")}`
      : `px-2 py-1 text-xs font-medium rounded-full ${t.bg} ${t.text}`;

  const fetchList = async (opts = {}) => {
    setLoading(true);
    try {
      const params = {
        page: opts.page ?? page,
        limit: opts.limit ?? limit,
      };
      if ((opts.search ?? query).trim()) params.search = opts.search ?? query;
      if ((opts.type ?? typeFilter).trim()) params.type = opts.type ?? typeFilter;
      if ((opts.from ?? dateFrom).trim()) params.from = opts.from ?? dateFrom;
      if ((opts.to ?? dateTo).trim()) params.to = opts.to ?? dateTo;

      const res = await api.get("/manager/notifications", { params });
      setData(res.data.data || []);
      setMeta(res.data.meta || {});
      setPage(params.page);
    } catch (err) {
      console.error("fetch notifications", err);
      setData([]);
      setMeta({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remove = async (id) => {
    const ok = await Swal.fire({
      title: "Delete?",
      text: "Delete this notification permanently?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });
    if (!ok.isConfirmed) return;
    try {
      await api.delete(`/manager/notifications/${id}`);
      Swal.fire("Deleted", "Notification deleted", "success");
      fetchList({ page: 1 });
    } catch (err) {
      Swal.fire("Error", err.response?.data?.msg || "Failed to delete", "error");
    }
  };

  const clearFilters = () => {
    setQuery("");
    setTypeFilter("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
    fetchList({ page: 1, search: "", type: "", from: "", to: "" });
  };

  const filteredCount = useMemo(() => data.length, [data]);

  return (
    <div className={`p-6 ${pageBg} min-h-full`}>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <HiMiniBellAlert className="text-blue-500 w-7 h-7" />
          <div>
            <h2 className={`text-xl font-semibold ${isDark ? "text-gray-100" : "text-gray-900"}`}>Create / Manage Notifications</h2>
            <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Create announcements, blog posts, notices and updates (Manager / HR / Admin).
            </div>
          </div>
        </div>

        {/* Filters & Actions - grouped and aligned */}
        <div className="ml-auto w-full md:w-auto">
          {/* Top row: search + type + primary actions */}
          <div className={`grid grid-cols-1 md:grid-cols-4 gap-2 items-center`}>
            <input
              placeholder="Search title or message"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`${inputBase} md:col-span-2`}
            />

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={selectBase}
            >
              <option value="">All types</option>
              <option value="Announcement">Announcement</option>
              <option value="Blog">Blog</option>
              <option value="Notice">Notice</option>
              <option value="Update">Update</option>
            </select>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => fetchList({ page: 1 })}
                className={smallBtn}
                aria-label="Search notifications"
              >
                Search
              </button>

              <button
                onClick={clearFilters}
                className={`px-3 py-2 ${isDark ? "bg-slate-700 text-gray-200" : "bg-white border"} rounded text-sm flex items-center gap-2`}
                aria-label="Clear filters"
                title="Clear filters"
              >
                <IoIosRemoveCircleOutline /> Clear
              </button>
            </div>
          </div>

          {/* Date range row with apply aligned right */}
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={inputBase}
              placeholder="From date"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={inputBase}
              placeholder="To date"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => fetchList({ page: 1 })}
                className={`${primaryBtn} bg-blue-600 hover:bg-blue-700 cursor-pointer`}
              >
                Apply Date
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary + New button */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className={`${isDark ? "text-gray-300" : "text-gray-600"} text-sm`}>
          Showing <strong>{filteredCount}</strong> notifications
          {meta.total ? <span> • total {meta.total}</span> : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpenCreate(true)}
            className={`${primaryBtn} bg-green-600 hover:bg-green-700 cursor-pointer`}
          >
            New Notification
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={skeletonBg} />
          ))
        ) : data.length === 0 ? (
          <div className={`col-span-full p-8 text-center ${isDark ? "text-gray-400" : "text-gray-500"} ${cardBg} rounded shadow`}>
            No notifications found. Create one using "New Notification".
          </div>
        ) : (
          data.map((n) => {
            const t = TYPE_COLORS[n.type] || TYPE_COLORS.Other;
            return (
              <article
                key={n._id}
                className={`${cardBg} border rounded-lg shadow-sm hover:shadow-md transition flex flex-col overflow-hidden`}
                aria-labelledby={`note-${n._id}`}
              >
                <div className="flex gap-4 p-4">
                  <div className="w-24 h-24 rounded overflow-hidden flex-shrink-0 bg-gray-50 border">
                    {n.image ? (
                      <img
                        src={`http://localhost:5000/notification_uploads/${n.image}`}
                        alt={n.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3 id={`note-${n._id}`} className="font-semibold text-lg truncate">
                        {n.title}
                      </h3>

                      <div className={badgeContainer(t)}>
                        <span className={`inline-block w-2 h-2 rounded-full mr-2`} style={{ backgroundColor: t.dot }} />
                        {n.type || "Other"}
                      </div>
                    </div>

                    <p className={`text-sm mt-2 ${isDark ? "text-gray-300" : "text-gray-600"} line-clamp-3 whitespace-pre-wrap`}>
                      {n.message}
                    </p>

                    <div className={`mt-3 flex items-center justify-between text-xs ${isDark ? "text-gray-400" : "text-gray-400"}`}>
                      <div>{new Date(n.createdAt).toLocaleString()}</div>
                      <div className="text-right">
                        <div className={`text-xs ${isDark ? "text-gray-300" : "text-gray-500"}`}>By: {n.createdByName || "Manager"}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`${isDark ? "bg-slate-900/70 border-t border-slate-700" : "bg-gray-50 border-t"} p-3 flex items-center justify-between gap-2`}>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(`/manager/notifications/${n._id}`, "_blank")}
                      className={`${isDark ? "px-3 py-1 bg-slate-800 border border-slate-700 text-gray-200" : "px-3 py-1 bg-white border text-sm"} rounded hover:bg-gray-100`}
                    >
                      View
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(window.location.origin + `/manager/notifications/${n._id}`);
                        Swal.fire("Copied", "Link copied to clipboard", "success");
                      }}
                      className={`${isDark ? "px-3 py-1 bg-slate-800 border border-slate-700 text-gray-200" : "px-3 py-1 bg-white border text-sm"} rounded hover:bg-gray-100`}
                    >
                      Share
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => remove(n._id)}
                      className="px-3 py-1 bg-red-700 text-white rounded text-sm hover:bg-red-800"
                      aria-label={`Delete notification ${n.title}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Pagination controls (simple) */}
      {meta.pages && meta.pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            className={`${isDark ? "px-3 py-1 bg-slate-700 text-gray-200 rounded" : "px-3 py-1 border rounded"}`}
            onClick={() => fetchList({ page: Math.max(1, (page || 1) - 1) })}
            disabled={(page || 1) <= 1}
          >
            Prev
          </button>
          <div className={isDark ? "text-gray-300" : ""}>Page {page || 1} of {meta.pages}</div>
          <button
            className={`${isDark ? "px-3 py-1 bg-slate-700 text-gray-200 rounded" : "px-3 py-1 border rounded"}`}
            onClick={() => fetchList({ page: Math.min(meta.pages, (page || 1) + 1) })}
            disabled={(page || 1) >= meta.pages}
          >
            Next
          </button>
        </div>
      )}

      <CreateNotificationModal
        open={openCreate}
        onClose={() => {
          setOpenCreate(false);
          fetchList({ page: 1 });
        }}
      />
    </div>
  );
}
