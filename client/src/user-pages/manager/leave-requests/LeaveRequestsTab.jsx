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

const STATUS_COLORS = {
  Pending: "#f59e0b",
  Verified: "#3b82f6",
  Approved: "#16a34a",
  Rejected: "#ef4444",
  Expired: "#9ca3af",
  Other: "#6b7280",
};

export default function LeaveRequestsTab() {
  const { isDark } = useContext(ThemeContext);

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // newest | oldest

  // Theme classes
  const pageBg = isDark ? "bg-slate-900 text-gray-200" : "bg-white text-gray-900";
  const panelBg = isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100";
  const inputBase = isDark
    ? "border p-2 rounded bg-slate-700 text-gray-200 border-slate-600"
    : "border p-2 rounded bg-white text-gray-800 border-gray-300";
  const selectBase = inputBase;
  const btnReset = isDark ? "px-3 py-1 bg-slate-700 text-gray-200 rounded hover:bg-slate-600" : "px-3 py-1 bg-gray-100 rounded hover:bg-gray-200";
  const btnPrimary = isDark ? "px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-500" : "px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700";
  const tableHeadBg = isDark ? "bg-slate-800 text-slate-100" : "bg-gray-50 text-gray-700";
  const rowHover = isDark ? "hover:bg-slate-700" : "hover:bg-gray-50";
  const badgeMapDark = {
    Pending: "bg-yellow-800 text-yellow-100",
    Verified: "bg-blue-900 text-blue-100",
    Approved: "bg-green-900 text-green-100",
    Rejected: "bg-rose-900 text-rose-100",
    Expired: "bg-slate-700 text-slate-100",
    Other: "bg-slate-700 text-slate-100",
  };
  const badgeMapLight = {
    Pending: "bg-yellow-100 text-yellow-800",
    Verified: "bg-blue-100 text-blue-800",
    Approved: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
    Expired: "bg-gray-200 text-gray-800",
    Other: "bg-gray-100 text-gray-700",
  };
  const emptyText = isDark ? "text-gray-400" : "text-gray-500";
  const analyticsCard = isDark ? "bg-slate-800 border-slate-700 text-gray-200" : "bg-white border-gray-100 text-gray-800";
  const modalBg = isDark ? "bg-slate-800 text-gray-200" : "bg-white text-gray-900";

  // fetch with fallback path (getLeaves or leaves)
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError(null);

      // try existing endpoint first, fallback to manager/leaves
      let res;
      try {
        res = await api.get("/manager/getLeaves");
      } catch (err) {
        res = await api.get("/manager/leaves");
      }

      // res.data may be array or { data: [...] }
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setLeaves(data);
    } catch (err) {
      console.error("fetchLeaves error", err);
      setError(err);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Helper: isExpired
  const isExpired = (toDate) => {
    if (!toDate) return false;
    try {
      const t = new Date(toDate);
      const today = new Date();
      // compare date-only
      const tOnly = new Date(t.getFullYear(), t.getMonth(), t.getDate());
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      return tOnly < todayOnly;
    } catch {
      return false;
    }
  };

  // Derived filtered list
  const filtered = useMemo(() => {
    if (!leaves || leaves.length === 0) return [];

    const q = (query || "").trim().toLowerCase();

    const out = leaves
      .map((l) => {
        const expired = isExpired(l.toDate);
        // show 'Expired' visually if expired and still Pending
        const effectiveStatus = expired && l.status === "Pending" ? "Expired" : l.status || "Other";
        return { ...l, effectiveStatus, expired: !!expired };
      })
      .filter((l) => {
        // status filter
        if (statusFilter !== "All" && (l.effectiveStatus || "").toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
        // text search (name, employeeId, leaveType, reason)
        if (!q) return true;
        return (
          (l.name || "").toLowerCase().includes(q) ||
          (l.employeeId || "").toLowerCase().includes(q) ||
          (l.leaveType || "").toLowerCase().includes(q) ||
          (l.reason || "").toLowerCase().includes(q)
        );
      });

    out.sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.appliedAt || b.createdAt || 0) - new Date(a.appliedAt || a.createdAt || 0);
      return new Date(a.appliedAt || a.createdAt || 0) - new Date(b.appliedAt || b.createdAt || 0);
    });

    return out;
  }, [leaves, statusFilter, query, sortOrder]);

  // Pie chart data (counts by effectiveStatus)
  const pieData = useMemo(() => {
    const counts = {};
    for (const l of leaves) {
      const expired = isExpired(l.toDate);
      const st = expired && l.status === "Pending" ? "Expired" : l.status || "Other";
      counts[st] = (counts[st] || 0) + 1;
    }
    return Object.keys(counts).map((k) => ({ name: k, value: counts[k] }));
  }, [leaves]);

  // Action handlers
  const updateStatus = async (id, endpoint, label) => {
    const ok = await Swal.fire({
      title: `Confirm ${label}?`,
      text: `Are you sure you want to ${label.toLowerCase()} this leave?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: label,
    });

    if (!ok.isConfirmed) return;

    try {
      // using manager endpoints you defined: /manager/leaves/:id/verify etc.
      await api.put(`/manager/leaves/${id}/${endpoint}`);
      Swal.fire("Success", `Leave ${label.toLowerCase()} successfully`, "success");
      fetchLeaves();
    } catch (err) {
      console.error("updateStatus error", err);
      Swal.fire("Error", err.response?.data?.msg || "Something went wrong", "error");
    }
  };

  if (loading) return <div className={`p-6 ${pageBg}`}>Loading leaves…</div>;
  if (error) return <div className={`p-6 ${pageBg} ${isDark ? "text-red-400" : "text-red-600"}`}>Error loading leave requests.</div>;

  return (
    <div className={`p-6 ${pageBg} min-h-full`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-xl font-semibold ${isDark ? "text-gray-100" : "text-gray-900"}`}>Employee Leave Requests</h2>

        <div className="flex gap-3 items-center">
          <input
            type="text"
            placeholder="Search by name, id, type, reason..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`${inputBase} w-72`}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={selectBase}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Verified">Verified</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Expired">Expired</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className={selectBase}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>

          <button
            onClick={() => { setQuery(""); setStatusFilter("All"); fetchLeaves(); }}
            className={btnReset}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: table (spans 2 columns on large screens) */}
        <div className={`lg:col-span-2 ${panelBg} rounded shadow p-4`}>
          <div className="mb-3 flex items-center justify-between">
            <div className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>Showing {filtered.length} results</div>
            <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Refresh to get latest</div>
          </div>

          <div className="overflow-auto max-h-[68vh]">
            <table className="w-full text-sm border-collapse">
              <thead className={`${tableHeadBg} sticky top-0`}>
                <tr>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Employee ID</th>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">From</th>
                  <th className="p-2 text-left">To</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="7" className={`p-4 text-center ${emptyText}`}>
                      No leave requests found.
                    </td>
                  </tr>
                )}

                {filtered.map((l) => {
                  const expired = isExpired(l.toDate);
                  const statusForBadge = expired && l.status === "Pending" ? "Expired" : l.status || "Other";

                  const badgeClassMap = isDark ? badgeMapDark : badgeMapLight;

                  return (
                    <tr key={l._id} className={`border-b ${rowHover}`}>
                      <td className="p-2">{l.name}</td>
                      <td className="p-2">{l.employeeId}</td>
                      <td className="p-2">{l.leaveType}</td>
                      <td className="p-2">{l.fromDate}</td>
                      <td className="p-2">{l.toDate}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 text-xs rounded ${badgeClassMap[statusForBadge] || (isDark ? "bg-slate-700 text-slate-100" : "bg-gray-100 text-gray-700")}`}>
                          {statusForBadge}
                        </span>
                      </td>

                      <td className="p-2 flex gap-2">
                        <button
                          className={btnPrimary}
                          onClick={() => setSelected(l)}
                        >
                          Details
                        </button>

                        {/* VERIFY button only available when Pending and not expired */}
                        {l.status === "Pending" && !expired && (
                          <button
                            className={isDark ? "px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-400" : "px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"}
                            onClick={() => updateStatus(l._id, "verify", "Verify")}
                          >
                            Verify
                          </button>
                        )}

                        {/* APPROVE/REJECT only after verification */}
                        {l.status === "Verified" && (
                          <>
                            <button
                              className={isDark ? "px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-400" : "px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"}
                              onClick={() => updateStatus(l._id, "approve", "Approve")}
                            >
                              Approve
                            </button>

                            <button
                              className={isDark ? "px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-400" : "px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"}
                              onClick={() => updateStatus(l._id, "reject", "Reject")}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Analytics */}
        <div className={`${analyticsCard} rounded shadow p-4`}>
          <h3 className="font-semibold mb-3">Analytics</h3>

          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.name} (${entry.value})`}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || STATUS_COLORS.Other} />
                  ))}
                </Pie>
                <ReTooltip wrapperStyle={{ backgroundColor: isDark ? "#0b1220" : "#fff", color: isDark ? "#e2e8f0" : "#0f172a" }} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: isDark ? "#e2e8f0" : "#0f172a" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <div className="font-medium">Status summary</div>
            <div className="grid grid-cols-2 gap-2">
              {pieData.map((p) => (
                <div key={p.name} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded" style={{ background: STATUS_COLORS[p.name] || STATUS_COLORS.Other }}></span>
                  <div>
                    <div className="text-sm">{p.name}</div>
                    <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{p.value} request(s)</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <button onClick={() => fetchLeaves()} className={isDark ? "px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500" : "px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"}>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* DETAILS MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className={`${modalBg} rounded-lg p-6 max-w-lg w-full shadow-lg overflow-auto max-h-[80vh]`}>
            <h3 className="text-lg font-semibold mb-3">Leave Details</h3>

            <div className="space-y-2 text-sm">
              <div><strong>Name:</strong> {selected.name}</div>
              <div><strong>Employee ID:</strong> {selected.employeeId}</div>
              <div><strong>Type:</strong> {selected.leaveType}</div>
              <div><strong>From:</strong> {selected.fromDate}</div>
              <div><strong>To:</strong> {selected.toDate}</div>
              <div><strong>Status:</strong> {selected.status}</div>
              <div><strong>Reason:</strong></div>
              <p className={isDark ? "text-gray-200 bg-slate-700 p-2 rounded whitespace-pre-wrap" : "text-gray-800 bg-gray-100 p-2 rounded whitespace-pre-wrap"}>{selected.reason}</p>
              <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Applied: {selected.appliedAt ? new Date(selected.appliedAt).toLocaleString() : "—"}</div>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setSelected(null)} className={isDark ? "px-3 py-1 bg-slate-700 text-gray-200 rounded hover:bg-slate-600" : "px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
