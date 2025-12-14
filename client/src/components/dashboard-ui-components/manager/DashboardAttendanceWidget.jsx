import React, { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ThemeContext } from "../../../context/ThemeContext";

// ---------- HELPERS ----------
function monthKeyFromDateISO(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function DashboardAttendanceWidget() {
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // current month only
  const monthKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  // ---------- FETCH ----------
  useEffect(() => {
    let cancelled = false;

    async function fetchAttendance() {
      try {
        setLoading(true);
        const res = await api.get("attendance/get");
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.data || [];

        const employeesOnly = data.filter(
          (r) => (r.role || "").toLowerCase() === "employee"
        );

        if (!cancelled) setRecords(employeesOnly);
      } catch (err) {
        console.error("dashboard attendance fetch error", err);
        if (!cancelled) setRecords([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAttendance();
    return () => (cancelled = true);
  }, []);

  // ---------- CALCULATE TOP 5 ----------
  const barData = useMemo(() => {
    const map = new Map();

    records.forEach((r) => {
      if (monthKeyFromDateISO(r.date) !== monthKey) return;

      const id = r.employeeId;
      if (!map.has(id)) {
        map.set(id, {
          name: r.name,
          present: 0,
          absent: 0,
        });
      }

      const status = (r.status || "").toLowerCase();
      if (status.includes("present")) map.get(id).present++;
      else if (status.includes("absent")) map.get(id).absent++;
    });

    return [...map.values()]
      .map((e) => {
        const total = e.present + e.absent;
        return {
          name: e.name.length > 14 ? e.name.slice(0, 12) + ".." : e.name,
          pct: total ? Math.round((e.present / total) * 100) : 0,
        };
      })
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 5);
  }, [records, monthKey]);

  const cardBg = isDark ? "bg-slate-800 text-gray-200" : "bg-white text-gray-900";
  const muted = isDark ? "text-gray-400" : "text-gray-500";
  const divider = isDark ? "border-slate-700" : "border-gray-200";

  return (
    <div className={`p-4 rounded shadow ${cardBg}`}>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Attendance Overview</h3>
        <button
          onClick={() => navigate("/manager/attendance")}
          className="text-xs text-blue-600 hover:underline"
        >
          View all
        </button>
      </div>

      {/* CHART */}
      <div className="h-40">
        {loading ? (
          <div className={`text-sm ${muted}`}>Loading attendance…</div>
        ) : barData.length === 0 ? (
          <div className={`text-sm ${muted}`}>No attendance data</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "#1f2937" : "#e5e7eb"}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: isDark ? "#cbd5e1" : "#374151", fontSize: 11 }}
              />
              <YAxis
                unit="%"
                tick={{ fill: isDark ? "#cbd5e1" : "#374151", fontSize: 11 }}
              />
              <Tooltip />
              <Bar
                dataKey="pct"
                name="Attendance %"
                fill={isDark ? "#60a5fa" : "#2563eb"}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* BOTTOM LIST */}
      {!loading && barData.length > 0 && (
        <>
          <div className={`my-3 border-t ${divider}`} />

          <div className="space-y-1">
            {barData.map((e, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs"
              >
                <span className="truncate">{e.name}</span>
                <span
                  className={`font-medium ${
                    e.pct < 80
                      ? isDark
                        ? "text-red-400"
                        : "text-red-600"
                      : isDark
                      ? "text-green-400"
                      : "text-green-600"
                  }`}
                >
                  {e.pct}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
