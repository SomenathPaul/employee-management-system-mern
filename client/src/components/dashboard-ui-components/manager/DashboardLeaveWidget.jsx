import React, { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { ThemeContext } from "../../../context/ThemeContext";

// Status colors (same meaning as main page)
const STATUS_COLORS = {
  Pending: "#f59e0b",
  Approved: "#16a34a",
  Rejected: "#ef4444",
  Expired: "#9ca3af",
  Other: "#6b7280",
};

export default function DashboardLeaveWidget() {
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---------- FETCH (SHORT DATASET) ----------
  useEffect(() => {
    let cancelled = false;

    async function fetchLeaves() {
      try {
        setLoading(true);

        let res;
        try {
          res = await api.get("/manager/getLeaves");
        } catch {
          res = await api.get("/manager/leaves");
        }

        const data = Array.isArray(res.data)
          ? res.data
          : res.data.data || [];

        if (!cancelled) setLeaves(data);
      } catch (err) {
        console.error("dashboard leave fetch error", err);
        if (!cancelled) setLeaves([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchLeaves();
    return () => (cancelled = true);
  }, []);

  // ---------- HELPERS ----------
  const isExpired = (toDate) => {
    if (!toDate) return false;
    const today = new Date();
    const t = new Date(toDate);
    return t.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0);
  };

  // ---------- PIE DATA ----------
  const pieData = useMemo(() => {
    const map = {};

    leaves.forEach((l) => {
      const expired = isExpired(l.toDate);
      const status =
        expired && l.status === "Pending"
          ? "Expired"
          : l.status || "Other";

      map[status] = (map[status] || 0) + 1;
    });

    return Object.keys(map).map((k) => ({
      name: k,
      value: map[k],
    }));
  }, [leaves]);

  // ---------- RECENT LEAVES ----------
  const recentLeaves = useMemo(() => {
    return [...leaves]
      .sort(
        (a, b) =>
          new Date(b.appliedAt || b.createdAt || 0) -
          new Date(a.appliedAt || a.createdAt || 0)
      )
      .slice(0, 5);
  }, [leaves]);

  const cardBg = isDark ? "bg-slate-800 text-gray-200" : "bg-white text-gray-900";
  const muted = isDark ? "text-gray-400" : "text-gray-500";

  return (
    <div className={`p-4 rounded shadow ${cardBg}`}>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Leave Requests</h3>
        <button
          onClick={() => navigate("/manager/employee-leave-requests")}
          className="text-xs text-blue-600 hover:underline"
        >
          View all
        </button>
      </div>

      {/* PIE CHART */}
      <div className="h-40 mb-3">
        {pieData.length === 0 ? (
          <div className={`text-sm ${muted}`}>No leave data</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={60}
              >
                {pieData.map((e) => (
                  <Cell
                    key={e.name}
                    fill={STATUS_COLORS[e.name] || STATUS_COLORS.Other}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* RECENT LIST */}
      {loading ? (
        <div className={`text-sm ${muted}`}>Loading leaves…</div>
      ) : recentLeaves.length === 0 ? (
        <div className={`text-sm ${muted}`}>No recent requests</div>
      ) : (
        <div className="space-y-2">
          {recentLeaves.map((l) => {
            const expired = isExpired(l.toDate);
            const status =
              expired && l.status === "Pending"
                ? "Expired"
                : l.status || "Other";

            return (
              <div
                key={l._id}
                className={`flex items-center justify-between text-xs p-2 rounded ${
                  isDark ? "bg-slate-700/50" : "bg-gray-50"
                }`}
              >
                <div className="truncate">
                  {l.name} • {l.leaveType}
                </div>

                <span
                  className="px-2 py-0.5 rounded text-white"
                  style={{
                    background:
                      STATUS_COLORS[status] || STATUS_COLORS.Other,
                  }}
                >
                  {status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
