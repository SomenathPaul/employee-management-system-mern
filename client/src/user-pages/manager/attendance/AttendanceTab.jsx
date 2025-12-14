// client/src/user-pages/manager/attendance/AttendanceTab.jsx
import React, { useEffect, useMemo, useState, useContext } from "react";
import api from "../../../utils/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  Tooltip as ReTooltip,
  CartesianGrid,
} from "recharts";
import { saveAs } from "file-saver";
import { ThemeContext } from "../../../context/ThemeContext";

// Month formatter
function monthKeyFromDateISO(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatPercent(n) {
  return `${Math.round(n * 100)}%`;
}

function prevMonth(m) {
  const [y, mm] = m.split("-").map(Number);
  const d = new Date(y, mm - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function nextMonth(m) {
  const [y, mm] = m.split("-").map(Number);
  const d = new Date(y, mm, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function AttendanceTab() {
  const { isDark } = useContext(ThemeContext);

  const [records, setRecords] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLeaves, setLoadingLeaves] = useState(true);
  const [error, setError] = useState(null);

  const [monthFilter, setMonthFilter] = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
  });

  const [employeeQuery, setEmployeeQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // ---- THEME CLASSES ----
  const pageBg = isDark ? "bg-app text-gray-200" : "bg-white text-gray-800";
  const panelBg = isDark ? "bg-slate-800/80 border-slate-700" : "bg-white border-gray-100";
  const inputBase = isDark
    ? "border p-2 rounded bg-slate-700 text-gray-200 border-slate-600"
    : "border p-2 rounded bg-white text-gray-800 border-gray-300";
  const smallBtn = isDark
    ? "px-3 py-2 bg-slate-700 text-gray-200 rounded"
    : "px-3 py-2 bg-gray-200 rounded";
  const exportBtn = "px-3 py-2 bg-green-600 text-white rounded";
  const tableHeadBg = isDark ? "bg-slate-800 text-slate-100" : "bg-gray-50 text-gray-700";
  const rowLowBg = isDark ? "bg-rose-900/30" : "bg-red-50";
  const badgeLow = isDark ? "bg-rose-800 text-rose-100" : "bg-red-200 text-red-800";
  const badgeOk = isDark ? "bg-green-700 text-green-100" : "bg-green-100 text-green-800";
  const emptyText = isDark ? "text-gray-400" : "text-gray-500";
  const cardBg = isDark ? "bg-slate-800/90 border-slate-700" : "bg-white border-gray-100";

  // ---------------------------
  // FETCH EMPLOYEE ATTENDANCE
  // ---------------------------
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await api.get("attendance/get");
        const all = Array.isArray(res.data) ? res.data : res.data.data || [];
        const employeesOnly = all.filter(
          (r) => (r.role || "").toLowerCase() === "employee"
        );
        if (!cancelled) setRecords(employeesOnly);
      } catch (err) {
        setError(err);
        setRecords([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => (cancelled = true);
  }, []);

  // --------------------------
  // FETCH LEAVES (YOUR LOGIC)
  // --------------------------
  useEffect(() => {
    let cancelled = false;

    const fetchLeaves = async () => {
      try {
        setLoadingLeaves(true);

        let res;
        try {
          res = await api.get("/manager/getLeaves");
        } catch (err) {
          res = await api.get("/manager/leaves");
        }

        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        if (!cancelled) setLeaves(data);
      } catch (err) {
        console.error("fetchLeaves error", err);
        if (!cancelled) setLeaves([]);
      } finally {
        if (!cancelled) setLoadingLeaves(false);
      }
    };

    fetchLeaves();
    return () => (cancelled = true);
  }, []);

  // -----------------------------------
  // GROUP ATTENDANCE BY EMPLOYEE
  // -----------------------------------
  const employees = useMemo(() => {
    const map = new Map();
    for (const r of records) {
      const id = r.employeeId;
      if (!id) continue;

      if (!map.has(id)) {
        map.set(id, { employeeId: id, name: r.name, records: [] });
      }
      map.get(id).records.push(r);
    }
    return Array.from(map.values());
  }, [records]);

  // ------------------------------------------------------
  // MAP APPROVED LEAVES TO EMPLOYEES (DATE RANGE BASED)
  // ------------------------------------------------------
  const approvedLeaveRangesByEmployee = useMemo(() => {
    const map = new Map();

    leaves
      .filter((l) => (l.status || "").toLowerCase() === "approved")
      .forEach((l) => {
        const emp = l.employeeId;
        const from = l.fromDate || l.from;
        const to = l.toDate || l.to;
        if (!emp || !from || !to) return;

        if (!map.has(emp)) map.set(emp, []);
        map.get(emp).push({
          from: new Date(from).toISOString().split("T")[0],
          to: new Date(to).toISOString().split("T")[0],
        });
      });

    return map;
  }, [leaves]);

  // ----------------------------------------------------
  // CALCULATE MONTHLY STATS PER EMPLOYEE
  // ----------------------------------------------------
  const employeeStats = useMemo(() => {
    const [y, m] = monthFilter.split("-").map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const todayISO = new Date().toISOString().split("T")[0];

    const isCurrentMonth = y === new Date().getFullYear() && m === new Date().getMonth() + 1;

    const monthDates = Array.from({ length: daysInMonth })
      .map((_, i) => new Date(y, m - 1, i + 1).toISOString().split("T")[0])
      .filter((d) => (!isCurrentMonth ? true : d <= todayISO));

    const stats = employees.map((emp) => {
      // ATTENDANCE MAP
      const recs = emp.records.filter(
        (r) => monthKeyFromDateISO(r.date) === monthFilter
      );

      const attMap = new Map();
      recs.forEach((r) => {
        const d = r.date;
        const s = (r.status || "").toLowerCase();
        const score = (x) =>
          x.includes("present") ? 3 : x.includes("leave") ? 2 : x.includes("absent") ? 1 : 0;

        if (!attMap.has(d)) attMap.set(d, s);
        else if (score(s) > score(attMap.get(d))) attMap.set(d, s);
      });

      // LEAVE RANGES
      const leaveRanges = approvedLeaveRangesByEmployee.get(emp.employeeId) || [];

      const isApprovedLeave = (d) =>
        leaveRanges.some((r) => d >= r.from && d <= r.to);

      // COUNTING
      let present = 0,
        absent = 0,
        leave = 0;

      for (const d of monthDates) {
        const status = attMap.get(d);

        if (status) {
          if (status.includes("present")) present++;
          else if (status.includes("leave")) leave++;
          else if (status.includes("absent")) absent++;
          else {
            if (isApprovedLeave(d)) leave++;
            else absent++;
          }
        } else {
          if (isApprovedLeave(d)) leave++;
          else absent++;
        }
      }

      const denom = present + absent;
      const presentPct = denom ? present / denom : 0;

      return {
        employeeId: emp.employeeId,
        name: emp.name,
        counts: { Present: present, Absent: absent, Leave: leave },
        total: present + absent + leave,
        presentPct,
      };
    });

    const q = employeeQuery.trim().toLowerCase();
    if (q)
      return stats.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.employeeId.toLowerCase().includes(q)
      );

    return stats;
  }, [employees, monthFilter, employeeQuery, approvedLeaveRangesByEmployee]);

  // ------------------------------------------------------
  // TOP 3 EMPLOYEES FOR BAR CHART
  // ------------------------------------------------------
  const barData = useMemo(() => {
    return [...employeeStats]
      .sort((a, b) => b.presentPct - a.presentPct)
      .slice(0, 3)
      .map((s) => ({
        name: s.name.length > 12 ? s.name.slice(0, 10) + ".." : s.name,
        pct: Math.round(s.presentPct * 100),
      }));
  }, [employeeStats]);

  // -------------------
  // EXPORT CSV
  // -------------------
  const exportCSV = () => {
    const header = ["employeeId", "name", "date", "status", "remarks"];
    const rows = records.map((r) => [
      r.employeeId,
      r.name,
      r.date,
      r.status,
      (r.remarks || "").replace(/\n/g, " "),
    ]);

    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    saveAs(
      new Blob([csv], { type: "text/csv" }),
      `attendance_${monthFilter}.csv`
    );
  };

  // --------------- RENDER ----------------

  if (loading || loadingLeaves)
    return <div className={`p-6 ${pageBg}`}>Loading attendance…</div>;

  if (error)
    return (
      <div className={`p-6 ${pageBg} ${emptyText}`}>
        Error loading attendance.
      </div>
    );

  return (
    <div className={`p-6 h-full overflow-hidden ${pageBg}`}>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center mb-4 gap-3">
        <h2 className={`text-xl font-semibold ${isDark ? "text-gray-100" : "text-gray-900"}`}>
          Attendance
        </h2>

        <div className="ml-auto flex flex-wrap gap-3 items-center">
          {/* Month arrows */}
          <div className="flex items-center gap-2">
            <button onClick={() => setMonthFilter(prevMonth(monthFilter))} className={smallBtn}>
              ←
            </button>

            <input
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className={inputBase}
            />

            <button onClick={() => setMonthFilter(nextMonth(monthFilter))} className={smallBtn}>
              →
            </button>
          </div>

          <input
            placeholder="Search name or ID"
            value={employeeQuery}
            onChange={(e) => setEmployeeQuery(e.target.value)}
            className={inputBase}
          />

          <button onClick={exportCSV} className={exportBtn}>
            Export CSV
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[80vh]">
        {/* LEFT TABLE */}
        <div className={`col-span-2 ${panelBg} rounded shadow p-4 overflow-y-auto`}>
          <table className="w-full text-sm border-collapse">
            <thead className={`${tableHeadBg} sticky top-0`}>
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Present</th>
                <th className="p-2 text-left">Absent</th>
                <th className="p-2 text-left">Leave</th>
                <th className="p-2 text-left">Total</th>
                <th className="p-2 text-left">Attendance</th>
                <th className="p-2 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {employeeStats.map((s, idx) => {
                const low = s.presentPct < 0.8;

                return (
                  <tr key={s.employeeId} className={`border-b ${low ? rowLowBg : ""}`}>
                    <td className="p-2">{idx + 1}</td>
                    <td className="p-2">{s.name}</td>
                    <td className="p-2">{s.employeeId}</td>
                    <td className="p-2">{s.counts.Present}</td>
                    <td className="p-2">{s.counts.Absent}</td>
                    <td className="p-2">{s.counts.Leave}</td>
                    <td className="p-2">{s.total}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          low ? badgeLow : badgeOk
                        }`}
                      >
                        {formatPercent(s.presentPct)}
                      </span>
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => setSelectedEmployee(s.employeeId)}
                        className={isDark ? "text-indigo-300" : "text-blue-600"}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}

              {employeeStats.length === 0 && (
                <tr>
                  <td colSpan="9" className={`p-4 text-center ${emptyText}`}>
                    No attendance records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* RIGHT PANEL */}
        <div className={`${cardBg} rounded shadow p-4 overflow-y-auto relative`}>
          <h3 className={`font-semibold mb-3 ${isDark ? "text-gray-100" : "text-gray-800"}`}>
            Analytics (Top 3)
          </h3>

          <div className="h-48 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1f2937" : "#e5e7eb"} />
                <XAxis dataKey="name" tick={{ fill: isDark ? "#cbd5e1" : "#374151" }} />
                <YAxis unit="%" tick={{ fill: isDark ? "#cbd5e1" : "#374151" }} />
                <ReTooltip />
                <Legend />
                <Bar dataKey="pct" name="Attendance (%)" fill={isDark ? "#60a5fa" : "#2563eb"} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* DETAILS PANEL */}
          <div>
            <h4 className={`font-medium mb-2 ${isDark ? "text-gray-100" : ""}`}>Selected Employee</h4>

            {!selectedEmployee && (
              <div className={emptyText}>Click “Details” from the table.</div>
            )}

            {selectedEmployee &&
              (() => {
                const e = employeeStats.find((x) => x.employeeId === selectedEmployee);
                if (!e) return <div className={emptyText}>No data available.</div>;

                return (
                  <div className="text-sm space-y-1">
                    <div><strong>Name:</strong> {e.name}</div>
                    <div><strong>ID:</strong> {e.employeeId}</div>
                    <div><strong>Present:</strong> {e.counts.Present}</div>
                    <div><strong>Absent:</strong> {e.counts.Absent}</div>
                    <div><strong>Leave:</strong> {e.counts.Leave}</div>
                    <div>
                      <strong>Attendance:</strong>{" "}
                      <span className={`px-2 py-1 rounded ${e.presentPct < 0.8 ? badgeLow : badgeOk}`}>
                        {formatPercent(e.presentPct)}
                      </span>
                    </div>
                  </div>
                );
              })()}
          </div>
        </div>
      </div>
    </div>
  );
}
