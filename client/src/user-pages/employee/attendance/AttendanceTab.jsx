// client/src/user-pages/employee/attendance/AttendanceTab.jsx
import React, { useContext, useMemo, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import AttendanceButton from "../../../components/AttendanceButton";
import { AttendanceContext } from "../../../context/AttendanceContext";
import { AuthContext } from "../../../context/AuthContext";
import { ThemeContext } from "../../../context/ThemeContext";
import api from "../../../utils/api";

const normalizeStatus = (s) => (s || "").toString().trim().toLowerCase();

const isApprovedLeaveStatus = (s) => {
  const n = normalizeStatus(s);
  return ["approved", "approve", "verified", "accepted"].includes(n);
};

const DATE_ISO = (d) => {
  if (!d) return null;
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return null;
  return dt.toISOString().split("T")[0];
};

const monthKey = (isoOrDate) => {
  const d = typeof isoOrDate === "string" && /^\d{4}-\d{2}$/.test(isoOrDate)
    ? new Date(isoOrDate + "-01")
    : new Date(isoOrDate);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

const daysInMonth = (year, monthIndex) => {
  return new Date(year, monthIndex + 1, 0).getDate();
};

const buildMonthDates = (ym) => {
  if (!ym || typeof ym !== "string" || !/^\d{4}-\d{2}$/.test(ym)) return [];
  const [y, m] = ym.split("-").map((x) => parseInt(x, 10));
  if (!y || !m || m < 1 || m > 12) return [];
  const count = daysInMonth(y, m - 1);
  const arr = Array.from({ length: count }).map((_, idx) => {
    const dt = new Date(y, m - 1, idx + 1);
    return DATE_ISO(dt);
  });
  return arr.filter(Boolean);
};

export default function AttendanceTab() {
  // stable hooks order
  const { user } = useContext(AuthContext);
  const { attendance = [], loading: attendanceLoading } = useContext(AttendanceContext);
  const { isDark } = useContext(ThemeContext);

  const [leaves, setLeaves] = useState([]);
  const [loadingLeaves, setLoadingLeaves] = useState(true);

  // default to current month
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

  // filter for log
  const [statusFilter, setStatusFilter] = useState("All");

  // derived: list of dates in month (safe)
  const monthDates = useMemo(() => buildMonthDates(selectedMonth), [selectedMonth]);

  // user's attendance records (all months) - stable
  const userAttendance = useMemo(
    () =>
      (attendance || []).filter(
        (record) =>
          (record.employeeId || "").toString() === (user?.employeeId || "").toString()
      ),
    [attendance, user]
  );

  // attendance by date for the selected month
  const attendanceByDate = useMemo(() => {
    const map = new Map();
    for (const r of userAttendance) {
      const d = DATE_ISO(r.date || r.recordedAt || r.attendanceDate);
      if (!d) continue;
      if (!d.startsWith(selectedMonth)) continue;
      const existing = map.get(d);
      if (!existing) map.set(d, r);
      else {
        const ex = normalizeStatus(existing.status);
        const cur = normalizeStatus(r.status);
        const score = (st) => (st === "present" ? 3 : st === "leave" ? 2 : st === "absent" ? 1 : 0);
        if (score(cur) > score(ex)) map.set(d, r);
      }
    }
    return map;
  }, [userAttendance, selectedMonth]);

  // approved leave ranges from fetched leaves
  const approvedLeaveRanges = useMemo(() => {
    return (leaves || [])
      .filter((l) => isApprovedLeaveStatus(l.status))
      .map((l) => {
        const from = DATE_ISO(l.fromDate || l.from || l.startDate || l.from);
        const to = DATE_ISO(l.toDate || l.to || l.endDate || l.to);
        return { from, to };
      })
      .filter((r) => r.from && r.to);
  }, [leaves]);

  const isDateInLeaves = (dateIso) => {
    if (!dateIso) return false;
    for (const r of approvedLeaveRanges) {
      if (!r.from || !r.to) continue;
      if (dateIso >= r.from && dateIso <= r.to) return true;
    }
    return false;
  };

  // compute summary/chart/log (treat future dates specially)
  const todayIso = DATE_ISO(new Date());
  const { summary, chartData, combinedLog } = useMemo(() => {
    const WEIGHT = { Present: 3, Leave: 2, Absent: 1 };
    let present = 0, leaveCount = 0, absent = 0;

    const chart = (monthDates || []).map((d) => {
      // future detection
      const isFuture = d > todayIso;

      const rec = attendanceByDate.get(d);
      const recStatus = rec ? normalizeStatus(rec.status) : null;

      let isPresent = false, isLeave = false, isAbsent = false;

      if (isFuture) {
        // future days: do not count anything, chart zeros
        isPresent = isLeave = isAbsent = false;
      } else {
        if (recStatus) {
          if (recStatus === "present") isPresent = true;
          else if (recStatus === "leave") isLeave = true;
          else if (recStatus === "absent") isAbsent = true;
          else {
            if (recStatus.includes("leave")) isLeave = true;
            else if (recStatus.includes("present")) isPresent = true;
            else if (recStatus.includes("absent")) isAbsent = true;
          }
        } else {
          // past day w/o record -> infer leave if approved, else absent
          if (isDateInLeaves(d)) isLeave = true;
          else isAbsent = true;
        }
      }

      // only increment totals for non-future days
      if (!isFuture) {
        if (isPresent) present++;
        if (isLeave) leaveCount++;
        if (isAbsent) absent++;
      }

      return {
        date: d ? d.slice(5) : "", // MM-DD for x-axis; safe slice
        Present: !isFuture && isPresent ? WEIGHT.Present : 0,
        Leave: !isFuture && isLeave ? WEIGHT.Leave : 0,
        Absent: !isFuture && isAbsent ? WEIGHT.Absent : 0,
        _iso: d,
        _future: isFuture,
        _flags: { isPresent, isLeave, isAbsent },
      };
    });

    // build combined log (recent-first): mark future as "Upcoming"
    const log = (monthDates || []).slice().reverse().map((d) => {
      const rec = attendanceByDate.get(d);
      const isFuture = d > todayIso;
      if (isFuture) return { dateIso: d, date: d, status: "Upcoming", remarks: "", source: "future" };

      if (rec) {
        return {
          dateIso: d,
          date: d,
          status: rec.status || "Present",
          remarks: rec.remarks || rec.note || "",
          source: "record",
        };
      }
      if (isDateInLeaves(d)) {
        return { dateIso: d, date: d, status: "Leave", remarks: "", source: "inferred" };
      }
      return { dateIso: d, date: d, status: "Absent", remarks: "", source: "inferred" };
    });

    return { summary: { present, leave: leaveCount, absent }, chartData: chart, combinedLog: log };
  }, [monthDates, attendanceByDate, approvedLeaveRanges, todayIso]);

  // fetch leaves for this user
  useEffect(() => {
    let cancelled = false;
    const fetchLeaves = async () => {
      setLoadingLeaves(true);
      try {
        const res = await api.get("/leaves/show"); // adjust endpoint if your backend differs
        const all = Array.isArray(res.data) ? res.data : res.data?.data || [];
        if (user?.employeeId) {
          const mine = all.filter((l) => (l.employeeId || "").toString() === (user.employeeId || "").toString());
          if (!cancelled) setLeaves(mine);
        } else {
          if (!cancelled) setLeaves([]);
        }
      } catch (err) {
        console.error("fetch leaves", err);
        if (!cancelled) setLeaves([]);
      } finally {
        if (!cancelled) setLoadingLeaves(false);
      }
    };
    fetchLeaves();
    return () => { cancelled = true; };
  }, [user]);

  const loading = attendanceLoading || loadingLeaves;

  // month navigation
  const goToPrevMonth = () => {
    const [y, m] = (selectedMonth || defaultMonth).split("-").map((x) => parseInt(x, 10));
    const d = new Date(y, m - 2, 1);
    const mk = monthKey(d);
    if (mk) setSelectedMonth(mk);
  };
  const goToNextMonth = () => {
    const [y, m] = (selectedMonth || defaultMonth).split("-").map((x) => parseInt(x, 10));
    const d = new Date(y, m, 1);
    const mk = monthKey(d);
    if (mk) setSelectedMonth(mk);
  };

  if (loading) return <p className={isDark ? "text-gray-200" : "text-gray-700"}>Loading attendance...</p>;

  // theme classes
  const pageBg = isDark ? "bg-app text-gray-200" : "bg-white text-gray-800";
  const panelBg = isDark ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-100";
  const cardShadow = "shadow-sm";

  return (
    <div className={`h-full p-6 overflow-y-auto ${pageBg} ${cardShadow}`}>
      <div className={`mb-6 border-b pb-3 flex flex-col md:flex-row gap-3 md:items-center justify-between ${isDark ? "border-slate-700" : "border-gray-200"}`}>
        <div>
          <h2 className={`text-2xl font-semibold ${isDark ? "text-gray-100" : "text-gray-800"}`}>Attendance Overview</h2>
          <div className="text-sm text-gray-500">Viewing month: {selectedMonth}</div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={goToPrevMonth} className={`px-3 py-2 bg-gray-100 cursor-pointer rounded ${isDark ? "bg-slate-700" : "bg-gray-200"}`}>Prev</button>
          <input type="month" value={selectedMonth} onChange={(e) => {
            const val = e.target.value;
            if (/^\d{4}-\d{2}$/.test(val)) setSelectedMonth(val);
          }} className="border p-2 rounded" />
          <button onClick={goToNextMonth} className={`px-3 py-2 bg-gray-100 cursor-pointer rounded ${isDark ? "bg-slate-700" : "bg-gray-200"}`}>Next</button>

          <AttendanceButton />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className={`${isDark ? "bg-green-900 border-l-4 border-green-700 text-green-200" : "bg-green-100 border-l-4 border-green-500 text-green-700"} p-4 rounded-lg ${cardShadow}`}>
          <h3 className="text-lg font-semibold">Present</h3>
          <p className="text-2xl font-bold">{summary.present}</p>
        </div>

        <div className={`${isDark ? "bg-red-900 border-l-4 border-red-700 text-red-200" : "bg-red-100 border-l-4 border-red-500 text-red-700"} p-4 rounded-lg ${cardShadow}`}>
          <h3 className="text-lg font-semibold">Absent</h3>
          <p className="text-2xl font-bold">{summary.absent}</p>
        </div>

        <div className={`${isDark ? "bg-yellow-900 border-l-4 border-yellow-700 text-yellow-200" : "bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700"} p-4 rounded-lg ${cardShadow}`}>
          <h3 className="text-lg font-semibold">On Leave</h3>
          <p className="text-2xl font-bold">{summary.leave}</p>
        </div>
      </div>

      <div className={`${panelBg} p-5 rounded-2xl ${cardShadow} border mb-8`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-gray-100" : "text-gray-700"}`}>Attendance Trend — {selectedMonth}</h3>
        <div className="w-full h-64">
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e5e7eb"} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: isDark ? "#cbd5e1" : "#374151" }} />
              <YAxis allowDecimals={false} tick={{ fill: isDark ? "#cbd5e1" : "#374151" }} />
              <Tooltip wrapperStyle={{ backgroundColor: isDark ? "#0f172a" : "#fff", color: isDark ? "#e2e8f0" : "#0f172a" }} />
              <Legend />
              <Bar dataKey="Present" stackId="a" fill="#16a34a" />
              <Bar dataKey="Leave" stackId="a" fill="#f59e0b" />
              <Bar dataKey="Absent" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`${panelBg} p-5 rounded-2xl ${cardShadow} border`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-gray-100" : "text-gray-700"}`}>Attendance Log — {selectedMonth}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className={`${isDark ? "bg-indigo-900 text-indigo-100" : "bg-indigo-100 text-gray-700"}`}>
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {combinedLog.filter(row => statusFilter === "All" || row.status === statusFilter).length > 0 ? (
                combinedLog
                  .filter(row => statusFilter === "All" || row.status === statusFilter)
                  .map((record) => (
                    <tr key={record.dateIso} className={`border-b transition-all ${isDark ? "hover:bg-slate-800 border-slate-700" : "hover:bg-indigo-50 border-gray-200"}`}>
                      <td className="py-2 px-4">{DATE_ISO(record.date) || "—"}</td>
                      <td className={`py-2 px-4 font-semibold ${record.status === "Present" ? (isDark ? "text-green-300" : "text-green-600") : record.status === "Leave" ? (isDark ? "text-yellow-300" : "text-yellow-600") : record.status === "Upcoming" ? (isDark ? "text-slate-300" : "text-gray-500") : (isDark ? "text-red-300" : "text-red-600")}`}>
                        {record.status || "—"}
                      </td>
                      <td className={`py-2 px-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}>{record.remarks || (record.source === "inferred" ? (record.status === "Absent" ? "No record (marked absent)" : "Inferred approved leave") : "")}</td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="3" className={`py-4 text-center ${isDark ? "text-gray-300" : "text-gray-500"}`}>No records matching filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
