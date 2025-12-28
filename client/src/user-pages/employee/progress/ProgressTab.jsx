// client/src/pages/employee/attendance/ProgressTab.jsx
import React, { useEffect, useMemo, useState, useContext } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import api from "../../../utils/api";
import { ThemeContext } from "../../../context/ThemeContext";
import TaskProgressChart from "../../../components/dashboard-ui-components/TaskProgressChart";
import DeadlinesCard from "../../../components/dashboard-ui-components/DeadlinesCard";
import { FiDownload, FiChevronLeft, FiChevronRight, FiCheckCircle, FiXCircle, FiCalendar } from "react-icons/fi";

/* ================= HELPERS ================= */
/**
 * Generates a string key for a month (YYYY-MM)
 */
const getMonthKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

/**
 * Returns the total number of days in a specific month
 */
const getDaysInMonth = (monthKey) => {
  const [y, m] = monthKey.split("-").map(Number);
  return new Date(y, m, 0).getDate();
};

/**
 * Formats a Date object to YYYY-MM-DD
 */
const formatDate = (date) => date.toISOString().slice(0, 10);

export default function ProgressTab() {
  const { isDark } = useContext(ThemeContext);

  // Reference for current time to disable future data
  const today = new Date();
  const todayStr = formatDate(today);

  // --- State Management ---
  const [month, setMonth] = useState(getMonthKey(today));
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= DATA FETCHING ================= */
useEffect(() => {
  const token = localStorage.getItem("token");
  setLoading(true);

  Promise.all([
    api.get("/attendance/me"),
    api.get("http://localhost:5000/api/leaves/show", {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ])
    .then(([attRes, leaveRes]) => {
  const user = JSON.parse(localStorage.getItem("user"));

  setAttendance(Array.isArray(attRes.data) ? attRes.data : []);

  const allLeaves = Array.isArray(leaveRes.data) ? leaveRes.data : [];

  // 🔑 FILTER LEAVES FOR CURRENT EMPLOYEE (SAME AS LeaveTab)
  const myLeaves = user
    ? allLeaves.filter((l) => l.employeeId === user.employeeId)
    : [];

  setLeaves(myLeaves);
})

    .catch((err) => {
      console.error("Progress fetch error:", err);
      setAttendance([]);
      setLeaves([]);
    })
    .finally(() => setLoading(false));
}, []);


  /* ================= DATA PROCESSING ================= */
  
  // Filter attendance records specifically for the selected month
  const monthAttendance = useMemo(() => {
    return attendance.filter(
      (a) => typeof a.date === "string" && a.date.startsWith(month)
    );
  }, [attendance, month]);

  // Create a fast-lookup map for attendance by date string
  const attendanceMap = useMemo(() => {
    const map = {};
    monthAttendance.forEach((r) => { map[r.date] = r; });
    return map;
  }, [monthAttendance]);

  // Create a set of all dates where a leave was approved for the user
  const approvedLeaveDates = useMemo(() => {
  const set = new Set();
  const [y, m] = month.split("-").map(Number);

  leaves.forEach((l) => {
    if (!l || String(l.status).toLowerCase() !== "approved") return;

    let current = new Date(l.fromDate);
    const end = new Date(l.toDate);

    while (current <= end) {
      if (
        current.getFullYear() === y &&
        current.getMonth() + 1 === m
      ) {
        set.add(formatDate(current));
      }
      current.setDate(current.getDate() + 1);
    }
  });

  return set;
}, [leaves, month]);


  // Calculate the high-level stats for the monthly summary
  const summary = useMemo(() => {
    let present = 0; let absent = 0; let leave = 0;
    const [y, m] = month.split("-").map(Number);
    const totalDaysInMonth = getDaysInMonth(month);

    for (let i = 1; i <= totalDaysInMonth; i++) {
      const date = `${y}-${String(m).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      if (date > todayStr) continue; // Don't count future days as absences

      if (approvedLeaveDates.has(date)) {
        leave++;
      } else if (attendanceMap[date]?.status === "PRESENT") {
        present++;
      } else {
        absent++;
      }
    }
    return { present, absent, leave };
  }, [attendanceMap, approvedLeaveDates, month, todayStr]);

  // Transform data into Recharts-friendly format
  const chartData = useMemo(() => {
    const totalDaysInMonth = getDaysInMonth(month);
    const [y, m] = month.split("-");

    return Array.from({ length: totalDaysInMonth }, (_, i) => {
      const day = String(i + 1).padStart(2, "0");
      const date = `${y}-${m}-${day}`;

      if (date > todayStr) return { day, status: "Future", value: 0 };
      if (approvedLeaveDates.has(date)) return { day, status: "Leave", value: 0.6 };
      if (attendanceMap[date]?.status === "PRESENT") return { day, status: "Present", value: 1 };
      return { day, status: "Absent", value: 0.3 };
    });
  }, [attendanceMap, approvedLeaveDates, month, todayStr]);

  /* ================= EXPORT LOGIC ================= */
  const downloadProgress = () => {
    let csv = "Date,Status\n";
    chartData.forEach((d) => {
      if (d.status !== "Future") csv += `${month}-${d.day},${d.status}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `HRly-Progress-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ================= RENDER LOGIC ================= */
  const pageBg = isDark ? "bg-slate-900 text-slate-100" : "bg-gray-50 text-slate-900";
  const cardBg = isDark ? "bg-slate-800/50 backdrop-blur-md border border-slate-700" : "bg-white shadow-sm border border-slate-200";

  if (loading) return (
    <div className={`p-8 h-full flex flex-col gap-4 animate-pulse ${pageBg}`}>
      <div className="h-10 w-48 bg-slate-700 rounded mb-6" />
      <div className="grid grid-cols-3 gap-6"><div className="h-24 bg-slate-700 rounded-xl" /><div className="h-24 bg-slate-700 rounded-xl" /><div className="h-24 bg-slate-700 rounded-xl" /></div>
      <div className="h-64 bg-slate-700 rounded-xl w-full" />
    </div>
  );

  return (
    <div className={`p-4 md:p-8 h-full overflow-y-auto transition-colors duration-300 ${pageBg}`}>
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">Progress Overview</h2>
          <p className="text-sm opacity-60 mt-1">Visualize your performance and attendance trends.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Month Navigation */}
          <div className={`flex items-center rounded-xl p-1 border ${isDark ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-white"}`}>
            <button
              onClick={() => {
                const d = new Date(month + "-01");
                d.setMonth(d.getMonth() - 1);
                setMonth(getMonthKey(d));
              }}
              className="p-2 hover:bg-blue-500/10 rounded-lg text-blue-500 transition-colors"
            ><FiChevronLeft /></button>
            
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-transparent text-sm font-bold px-2 outline-none cursor-pointer"
            />

            <button
              onClick={() => {
                const d = new Date(month + "-01");
                d.setMonth(d.getMonth() + 1);
                setMonth(getMonthKey(d));
              }}
              className="p-2 hover:bg-blue-500/10 rounded-lg text-blue-500 transition-colors"
            ><FiChevronRight /></button>
          </div>

          <button
            onClick={downloadProgress}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 text-sm"
          >
            <FiDownload /> <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <SummaryCard title="Present" value={summary.present} icon={<FiCheckCircle />} color="emerald" isDark={isDark} />
        <SummaryCard title="Absent" value={summary.absent} icon={<FiXCircle />} color="rose" isDark={isDark} />
        <SummaryCard title="On Leave" value={summary.leave} icon={<FiCalendar />} color="amber" isDark={isDark} />
      </div>

      {/* CHART SECTION */}
      <div className={`${cardBg} p-6 rounded-3xl mb-8`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg">Monthly Attendance Trend</h3>
          <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest opacity-60">
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"/> Present</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"/> Absent</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"/> Leave</div>
          </div>
        </div>
        
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#e2e8f0"} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDark ? "#94a3b8" : "#64748b" }} />
              <YAxis domain={[0, 1]} hide />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: isDark ? '#1e293b' : '#fff' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={12}>
                {chartData.map((e, i) => (
                  <Cell
                    key={i}
                    fill={
                      e.status === "Present" ? "#10b981" :
                      e.status === "Leave" ? "#f59e0b" :
                      e.status === "Absent" ? "#f43f5e" : "transparent"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ADDITIONAL ANALYTICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DeadlinesCard />
        <TaskProgressChart />
      </div>
    </div>
  );
}

/* ================= COMPONENT: SUMMARY CARD ================= */
/**
 * Renders a stylized card with an icon and count for summary stats.
 */
function SummaryCard({ title, value, icon, color, isDark }) {
  const themes = {
    emerald: isDark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-100",
    rose: isDark ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-rose-50 text-rose-700 border-rose-100",
    amber: isDark ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-amber-50 text-amber-700 border-amber-100",
  };

  return (
    <div className={`p-6 rounded-2xl border transition-all hover:shadow-lg flex items-center justify-between ${themes[color]}`}>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">{title}</p>
        <p className="text-3xl font-black">{value}</p>
      </div>
      <div className="text-3xl opacity-40">
        {icon}
      </div>
    </div>
  );
}