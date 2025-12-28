// client/src/user-pages/manager/notifications/ManagerNotificationsTab.jsx
import React, { useEffect, useMemo, useState, useContext } from "react";
import api from "../../../utils/api";
import Swal from "sweetalert2";
import CreateNotificationModal from "./CreateNotificationModal";
import { HiMiniBellAlert } from "react-icons/hi2";
import { IoIosRemoveCircleOutline } from "react-icons/io";
import { ThemeContext } from "../../../context/ThemeContext";
import {
  FiEye,
  FiX,
  FiPlus,
  FiSearch,
  FiCalendar,
  FiTrash2,
} from "react-icons/fi";

/**
 * ManagerNotificationsTab Component
 * Purpose: Central hub for Managers/Admin to create, view, and delete company-wide notifications.
 * Features: Type-based color coding, date filtering, and server-side pagination.
 */
const TYPE_CONFIG = {
  Announcement: {
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    border: "border-blue-500",
    label: "Announcement",
  },
  Blog: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500",
    label: "Blog Post",
  },
  Notice: {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500",
    label: "Official Notice",
  },
  Update: {
    bg: "bg-purple-500/10",
    text: "text-purple-500",
    border: "border-purple-500",
    label: "System Update",
  },
  Other: {
    bg: "bg-slate-500/10",
    text: "text-slate-500",
    border: "border-slate-500",
    label: "General",
  },
};

export default function ManagerNotificationsTab() {
  const { isDark } = useContext(ThemeContext);

  // --- STATE MANAGEMENT ---
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [viewNote, setViewNote] = useState(null);

  // Filter States
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [page, setPage] = useState(1);
  const limit = 24;

  // --- THEME CLASSES ---
  const pageBg = isDark
    ? "bg-slate-900 text-slate-100"
    : "bg-gray-50 text-slate-900";
  const cardBg = isDark
    ? "bg-slate-950/50"
    : "bg-white shadow-sm";
  const inputCardBg = isDark
    ? "bg-slate-950/50 border border-slate-800 shadow-sm"
    : "bg-white shadow-sm border border-gray-200";
  const inputBase = isDark
    ? "bg-slate-800 border-slate-700 text-white focus:ring-blue-500/50"
    : "bg-white border-gray-200 text-slate-900 focus:ring-blue-500/20";

  /* ================= FETCHING LOGIC ================= */
  const fetchList = async (opts = {}) => {
    setLoading(true);
    try {
      const params = {
        page: opts.page ?? page,
        limit: opts.limit ?? limit,
        search: (opts.search ?? query).trim() || undefined,
        type: (opts.type ?? typeFilter).trim() || undefined,
        from: (opts.from ?? dateFrom).trim() || undefined,
        to: (opts.to ?? dateTo).trim() || undefined,
      };

      const res = await api.get("/manager/notifications", { params });
      setData(res.data.data || []);
      setMeta(res.data.meta || {});
      setPage(params.page);
    } catch (err) {
      console.error("fetch notifications error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList({ page: 1 });
  }, []);

  /* ================= ACTION HANDLERS ================= */
  const removeNotification = async (id) => {
    const result = await Swal.fire({
      title: "Delete Notification?",
      text: "This will remove the update from all employee dashboards.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Delete Permanently",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/manager/notifications/${id}`);
      Swal.fire("Deleted", "Notification has been removed.", "success");
      fetchList({ page: 1 });
    } catch (err) {
      Swal.fire("Error", "Action failed. Please try again.", "error");
    }
  };

  const clearFilters = () => {
    setQuery("");
    setTypeFilter("");
    setDateFrom("");
    setDateTo("");
    fetchList({ page: 1, search: "", type: "", from: "", to: "" });
  };

  return (
    <div
      className={`p-4 md:p-8 h-full overflow-y-auto transition-colors duration-300 ${pageBg}`}
    >
      {/* --- HEADER & MANAGEMENT BAR --- */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20">
            <HiMiniBellAlert size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">
              Notification Center
            </h2>
            <p className="text-sm opacity-60">
              Broadcast updates and manage company insights.
            </p>
          </div>
        </div>

        {/* --- DYNAMIC FILTER TOOLBAR --- */}
        <div
          className={`p-4 rounded-3xl ${inputCardBg} border shadow-xl flex flex-col md:flex-row items-center gap-3`}
        >
          <div className="relative group w-full md:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:text-blue-500 transition-colors" />
            <input
              placeholder="Search content..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`${inputBase} w-full pl-10 pr-4 py-2 rounded-xl border outline-none transition-all`}
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={`${inputBase} w-full md:w-40 px-4 py-2 rounded-xl border outline-none cursor-pointer`}
          >
            <option value="">All Categories</option>
            {Object.keys(TYPE_CONFIG)
              .filter((k) => k !== "Other")
              .map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
          </select>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => fetchList({ page: 1 })}
              className="flex-1 md:flex-none px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
            >
              Apply
            </button>
            <button
              onClick={clearFilters}
              className="p-2.5 rounded-xl border border-slate-500/20 hover:bg-slate-500/10 text-slate-500 transition-all"
              title="Reset Filters"
            >
              <IoIosRemoveCircleOutline size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* --- SUB-HEADER: STATS & CREATE --- */}
      <div className="flex items-center justify-between mb-6 px-2">
        <p className="text-xs font-black uppercase tracking-widest opacity-40">
          Showing {data.length} of {meta.total || 0} Results
        </p>
        <button
          onClick={() => setOpenCreate(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-sm"
        >
          <FiPlus /> New Notification
        </button>
      </div>

      {/* --- NOTIFICATION GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-48 w-full bg-slate-800/20 animate-pulse rounded-3xl"
            />
          ))
        ) : data.length === 0 ? (
          <div className="col-span-full py-20 text-center opacity-40 italic">
            No broadcast data found for the current selection.
          </div>
        ) : (
          data.map((n) => {
            const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.Other;
            return (
              <article
                key={n._id}
                className={`${cardBg} rounded-3xl border-l-[6px] ${config.border} p-5 flex flex-col h-full transition-all hover:shadow-2xl hover:-translate-y-1 group`}
              >
                <div className="flex gap-5 flex-1">
                  {/* Media Preview */}
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-inherit shrink-0">
                    {n.image ? (
                      <img
                        src={`http://localhost:5000/notification_uploads/${n.image}`}
                        alt=""
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-20">
                        <HiMiniBellAlert size={32} />
                      </div>
                    )}
                  </div>

                  {/* Text Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-lg truncate group-hover:text-blue-500 transition-colors">
                        {n.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter ${config.bg} ${config.text}`}
                      >
                        {n.type}
                      </span>
                    </div>
                    <p className="text-sm opacity-70 line-clamp-2 leading-relaxed mb-4">
                      {n.message}
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-bold opacity-40 uppercase tracking-tight">
                      <span className="flex items-center gap-1">
                        <FiCalendar />{" "}
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                      <span className="truncate ml-2">
                        By: {n.createdByName || "Admin"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-4 border-t border-inherit flex items-center justify-between">
                  <button
                    onClick={() => setViewNote(n)}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:underline"
                  >
                    <FiEye /> Detailed View
                  </button>
                  <button
                    onClick={() => removeNotification(n._id)}
                    className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Delete Broadcast"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* --- PAGINATION --- */}
      {meta.pages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-4">
          <button
            className={`p-2 rounded-xl border ${inputBase} disabled:opacity-20 transition-all`}
            onClick={() => fetchList({ page: page - 1 })}
            disabled={page <= 1}
          >
            <FiPlus className="rotate-45" /> {/* Simple Prev Hack */}
          </button>
          <span className="text-sm font-black opacity-60 uppercase tracking-widest">
            Page {page} of {meta.pages}
          </span>
          <button
            className={`p-2 rounded-xl border ${inputBase} disabled:opacity-20 transition-all`}
            onClick={() => fetchList({ page: page + 1 })}
            disabled={page >= meta.pages}
          >
            <FiPlus /> {/* Simple Next Hack */}
          </button>
        </div>
      )}

      {/* --- DETAILED VIEW MODAL --- */}
      {viewNote && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className={`${
              isDark ? "bg-slate-900" : "bg-white"
            } w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300`}
          >
            <div className="flex items-center justify-between p-6 border-b border-inherit">
              <h2 className="text-xl font-black">{viewNote.title}</h2>
              <button
                onClick={() => setViewNote(null)}
                className="p-2 rounded-full hover:bg-slate-500/10 opacity-50"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto">
              {viewNote.image && (
                <div className="w-full aspect-video rounded-2xl overflow-hidden mb-6 border shadow-inner bg-slate-100 dark:bg-slate-800">
                  <img
                    src={`http://localhost:5000/notification_uploads/${viewNote.image}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                <span className="px-3 py-1 bg-blue-500 text-white text-[10px] font-black uppercase rounded-lg tracking-widest">
                  {viewNote.type}
                </span>
                <span className="text-xs font-bold opacity-40">
                  {new Date(viewNote.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="text-base leading-relaxed opacity-80 whitespace-pre-wrap border-l-4 border-blue-500 pl-6 italic">
                {viewNote.message}
              </div>
            </div>

            <div className="p-6 bg-slate-500/5 flex justify-end">
              <button
                onClick={() => setViewNote(null)}
                className="px-8 py-2 bg-slate-800 text-white dark:bg-white dark:text-slate-900 rounded-xl font-black text-sm"
              >
                Close Insight
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Import */}
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
