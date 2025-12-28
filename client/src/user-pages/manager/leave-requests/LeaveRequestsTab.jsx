// client/src/user-pages/manager/leave-requests/LeaveRequestsTab.jsx
import React, { useEffect, useMemo, useState, useContext } from "react";
import api from "../../../utils/api";
import Swal from "sweetalert2";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend,
} from "recharts";
import { ThemeContext } from "../../../context/ThemeContext";
import { FiSearch, FiFilter, FiClock, FiCheckCircle, FiXCircle, FiInfo, FiRefreshCw } from "react-icons/fi";

const STATUS_COLORS = {
  Pending: "#f59e0b",
  Verified: "#3b82f6",
  Approved: "#16a34a",
  Rejected: "#ef4444",
  Expired: "#9ca3af",
  Other: "#6b7280",
};

/**
 * LeaveRequestsTab Component
 * Purpose: Central management hub for leave requests for Managers.
 * Features: Analytics overview, multi-level status filtering, and workflow actions (Verify/Approve/Reject).
 */
export default function LeaveRequestsTab() {
  const { isDark } = useContext(ThemeContext);

  // --- STATE MANAGEMENT ---
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI / Filter States
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  // --- THEME-BASED DYNAMIC CLASSES ---
  const pageBg = isDark ? "bg-slate-900 text-slate-100" : "bg-gray-50 text-slate-900";
  const cardBg = isDark ? "bg-slate-800/50 backdrop-blur-md border-slate-700" : "bg-white border-gray-100 shadow-sm";
  const inputBase = isDark 
    ? "bg-slate-700 border-slate-600 text-white focus:ring-indigo-500/50" 
    : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500/20";
  const badgeMap = isDark ? {
    Pending: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    Verified: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    Approved: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    Rejected: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
    Expired: "bg-slate-500/20 text-slate-400 border border-slate-500/30",
  } : {
    Pending: "bg-amber-100 text-amber-700 border border-amber-200",
    Verified: "bg-blue-100 text-blue-700 border border-blue-200",
    Approved: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    Rejected: "bg-rose-100 text-rose-700 border border-rose-200",
    Expired: "bg-gray-100 text-gray-700 border border-gray-200",
  };

  /* ================= FETCHING LOGIC ================= */
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError(null);
      let res;
      try {
        res = await api.get("/manager/leaves/getLeaves");
      } catch {
        res = await api.get("/manager/leaves");
      }
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setLeaves(data);
    } catch (err) {
      console.error("fetchLeaves error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  /* ================= HELPERS & PROCESSING ================= */
  const isExpired = (toDate) => {
    if (!toDate) return false;
    const t = new Date(toDate);
    const today = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate()) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  // Memoized filter and sort logic for better performance
  const filtered = useMemo(() => {
    if (!leaves) return [];
    const q = query.trim().toLowerCase();
    
    let list = leaves.map(l => ({
      ...l,
      effectiveStatus: isExpired(l.toDate) && l.status === "Pending" ? "Expired" : l.status || "Other",
      expired: isExpired(l.toDate)
    }));

    if (statusFilter !== "All") {
      list = list.filter(l => l.effectiveStatus.toLowerCase() === statusFilter.toLowerCase());
    }

    if (q) {
      list = list.filter(l => 
        (l.name || "").toLowerCase().includes(q) || 
        (l.employeeId || "").toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => {
      const timeA = new Date(a.appliedAt || a.createdAt || 0);
      const timeB = new Date(b.appliedAt || b.createdAt || 0);
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });
  }, [leaves, statusFilter, query, sortOrder]);

  const pieData = useMemo(() => {
    const counts = {};
    leaves.forEach(l => {
      const st = isExpired(l.toDate) && l.status === "Pending" ? "Expired" : l.status || "Other";
      counts[st] = (counts[st] || 0) + 1;
    });
    return Object.keys(counts).map(k => ({ name: k, value: counts[k] }));
  }, [leaves]);

  /* ================= WORKFLOW ACTIONS ================= */
  const updateStatus = async (id, endpoint, label) => {
    const ok = await Swal.fire({
      title: `Confirm ${label}?`,
      text: `Process this request as ${label.toLowerCase()}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: label === "Reject" ? "#ef4444" : "#4f46e5",
      confirmButtonText: `Yes, ${label}`
    });

    if (!ok.isConfirmed) return;

    try {
      await api.put(`/manager/leaves/${id}/${endpoint}`);
      Swal.fire("Processed", `Leave request ${label.toLowerCase()}ed.`, "success");
      fetchLeaves();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.msg || "Update failed", "error");
    }
  };

  if (loading) return <div className={`p-10 text-center ${pageBg} h-screen`}>Loading Management Portal...</div>;

  return (
    <div className={`p-4 md:p-8 h-full overflow-y-auto transition-colors duration-300 ${pageBg}`}>
      
      {/* --- HEADER & FILTERS --- */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Request Oversight</h2>
          <p className="text-sm opacity-60">Audit and process employee leave applications.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:text-blue-500 transition-colors" />
            <input
              placeholder="Search employee or ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`${inputBase} sm:w-64 w-55 pl-10 pr-4 py-2 rounded-xl border outline-none transition-all`}
            />
          </div>

          <div className="flex items-center gap-2">
            <FiFilter className="opacity-40" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${inputBase} px-4 py-2 rounded-xl border outline-none`}>
              <option value="All">All Statuses</option>
              {["Pending", "Verified", "Approved", "Rejected", "Expired"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <button onClick={fetchLeaves} className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all active:scale-95">
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* --- MAIN LISTING --- */}
        <div className={`lg:col-span-3 ${cardBg} rounded-3xl overflow-hidden border transition-all`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className={`${isDark ? "bg-slate-700/50" : "bg-slate-50"} text-[10px] font-black uppercase tracking-widest opacity-60`}>
                  <th className="p-5">Employee</th>
                  <th className="p-5">Type</th>
                  <th className="p-5">Duration</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-700" : "divide-gray-100"}`}>
                {filtered.map((l) => (
                  <tr key={l._id} className="hover:bg-blue-500/5 transition-colors group">
                    <td className="p-5">
                      <div className="font-bold">{l.name}</div>
                      <div className="text-[10px] opacity-50 font-mono">{l.employeeId}</div>
                    </td>
                    <td className="p-5 font-medium">{l.leaveType}</td>
                    <td className="p-5">
                      <div className="flex items-center gap-1 opacity-80">
                        <span className="font-bold">{l.fromDate}</span>
                        <span className="opacity-40 text-xs">→</span>
                        <span className="font-bold">{l.toDate}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${badgeMap[l.effectiveStatus] || "bg-gray-100"}`}>
                        {l.effectiveStatus}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setSelected(l)} className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors" title="View Reason">
                          <FiInfo size={18} />
                        </button>
                        
                        {l.status === "Pending" && !l.expired && (
                          <button onClick={() => updateStatus(l._id, "verify", "Verify")} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-500/20">Verify</button>
                        )}

                        {l.status === "Verified" && (
                          <>
                            <button onClick={() => updateStatus(l._id, "approve", "Approve")} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-500/20">Approve</button>
                            <button onClick={() => updateStatus(l._id, "reject", "Reject")} className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold shadow-md shadow-rose-500/20">Reject</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="p-20 text-center opacity-40 italic">No matching requests found.</div>}
          </div>
        </div>

        {/* --- ANALYTICS SIDEBAR --- */}
        <div className="lg:col-span-1 space-y-6">
          <div className={`${cardBg} p-6 rounded-3xl border`}>
            <h3 className="font-black text-xs uppercase tracking-widest opacity-60 mb-6 flex items-center gap-2">
               <FiClock className="text-blue-500" /> Data Overview
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || STATUS_COLORS.Other} stroke="none" />
                    ))}
                  </Pie>
                  <ReTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 space-y-3">
              {pieData.map((p) => (
                <div key={p.name} className="flex items-center justify-between p-3 rounded-2xl bg-slate-500/5 border border-slate-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[p.name] }} />
                    <span className="text-xs font-bold opacity-80">{p.name}</span>
                  </div>
                  <span className="text-sm font-black">{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- REASON MODAL --- */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300`}>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-black uppercase tracking-tight">Request Details</h3>
              <button onClick={() => setSelected(null)} className="p-2 rounded-full hover:bg-slate-500/10 opacity-50"><FiXCircle size={24} /></button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-black uppercase opacity-40">Employee</label><p className="font-bold">{selected.name}</p></div>
                <div><label className="text-[10px] font-black uppercase opacity-40">Type</label><p className="font-bold">{selected.leaveType}</p></div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase opacity-40 mb-2 block">Manager's Note / Reason</label>
                <div className={`p-4 rounded-2xl ${isDark ? "bg-slate-900" : "bg-slate-50"} text-sm leading-relaxed italic border border-inherit`}>
                  "{selected.reason}"
                </div>
              </div>

              <div className="flex justify-end pt-4"><button onClick={() => setSelected(null)} className="px-8 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg">Acknowledged</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}