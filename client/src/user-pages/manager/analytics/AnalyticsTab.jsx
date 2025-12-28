// client/src/user-pages/manager/analytics/AnalyticsTab.jsx
import React, { useEffect, useState, useContext, useMemo } from "react";
import api from "../../../utils/api";
import {
  PieChart,
  Pie,
  Legend,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";
import { ThemeContext } from "../../../context/ThemeContext";
import DashboardLeaveWidget from "../../../components/dashboard-ui-components/manager/DashboardLeaveWidget";
import DashboardTaskWidget from "../../../components/dashboard-ui-components/manager/DashboardTaskWidget";
import {
  FiSearch,
  FiCalendar,
  FiX,
  FiActivity,
  FiUsers,
  FiDownload,
  FiFileText,
} from "react-icons/fi";

/* ---------------- CONSTANTS ---------------- */
const TASK_COLORS = ["#facc15", "#3b82f6", "#22c55e"];
const LEAVE_COLORS = ["#22c55e", "#facc15"];
const ATTENDANCE_COLORS = ["#3b82f6", "#f43f5e"];

const getMonthKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

export default function AnalyticsTab() {
  const { isDark } = useContext(ThemeContext);

  // --- States ---
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState(() => getMonthKey(new Date()));
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);

  /* ================= FETCH GLOBAL SUMMARY ================= */
  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const res = await api.get("/manager/attendance/summary", {
          params: { month },
        });
        setAttendanceSummary(res.data || []);
      } catch (err) {
        console.error("Failed to load attendance summary", err);
        setAttendanceSummary([]);
      }
    };
    fetchGlobalStats();
  }, [month]);

  /* ================= FETCH EMPLOYEE DIRECTORY ================= */
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const res = await api.get("/manager/employees", {
          params: { page: 1, limit: 1000 },
        });
        const data = res.data?.data || [];
        setEmployees(
          data.filter((u) => (u.role || "").toLowerCase() === "employee")
        );
      } catch (err) {
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // 1. lookup map for instant name access
  const nameMap = useMemo(() => {
    const map = {};

    // Fill from global employee list first
    employees.forEach((e) => {
      if (e.employeeId) map[String(e.employeeId).trim()] = e.name;
    });

    // Overwrite/Fill from attendance summary if names exist there
    attendanceSummary.forEach((a) => {
      if (a.employeeId && a.employeeName) {
        map[String(a.employeeId).trim()] = a.employeeName;
      }
    });

    return map;
  }, [employees, attendanceSummary]);

  /* ================= DEEP DIVE ANALYTICS ================= */
  const viewFullAnalytics = async (employee) => {
    try {
      setDetailsLoading(true);
      const [taskRes, leaveRes, attendanceRes] = await Promise.all([
        api.get("/manager/tasks"),
        api.get("/manager/leaves/getLeaves"),
        api.get("/manager/attendance/all", {
          params: { month, employeeId: employee.employeeId },
        }),
      ]);

      setDetails({
        employee,
        tasks: (taskRes.data?.data || []).filter((t) =>
          t.assignedTo?.some((a) => a.employeeId === employee.employeeId)
        ),
        leaves: (leaveRes.data?.data || leaveRes.data || []).filter(
          (l) => l.employeeId === employee.employeeId
        ),
        attendance: attendanceRes.data?.data || attendanceRes.data || [],
      });
    } catch (err) {
      console.error("Deep dive fetch failed", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleExport = () => {
    if (!details) return;
    const dataStr = JSON.stringify(details, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${details.employee.name}_Audit_${month}.json`;
    link.click();
  };

  const filteredEmployees = useMemo(() => {
    const q = search.toLowerCase();
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.employeeId.toLowerCase().includes(q)
    );
  }, [employees, search]);

  const pageBg = isDark
    ? "bg-slate-950 text-slate-100"
    : "bg-gray-50 text-slate-900";
  const cardBg = isDark
    ? "bg-slate-900/50 backdrop-blur-md border border-slate-800 shadow-xl"
    : "bg-white border-gray-100 shadow-sm";
  const inputBg = isDark
    ? "bg-slate-800 border-slate-700 text-white"
    : "bg-white border-gray-200 text-black";

  if (loading)
    return (
      <div
        className={`h-full ${
          isDark ? "bg-slate-900" : "bg-white"
        } flex items-center justify-center animate-pulse font-black tracking-widest`}
      >
        SYNCHRONIZING REVISOR...
      </div>
    );

  return (
    <div
      className={`p-4 md:p-8 h-full overflow-y-auto transition-all duration-300 ${pageBg}`}
    >
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase">
            Organizational Audit
          </h2>
          <p className="text-sm opacity-50 italic">
            Auditing Month:{" "}
            <span className="text-blue-500 font-bold underline">{month}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-blue-500 transition-colors" />
            <input
              placeholder="Filter by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${inputBg} w-64 pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all`}
            />
          </div>
          
        </div>
      </div>

      {/* DIRECTORY TABLE */}
      <div
        className={`${cardBg} rounded-[2rem] overflow-hidden border shadow-xl mb-12`}
      >
        <table className="w-full text-sm text-left">
          <thead
            className={`bg-slate-500/5 text-[10px] font-black uppercase tracking-widest opacity-60 border-b border-inherit`}
          >
            <tr>
              <th className="p-6">Employee Member</th>
              <th className="p-6">System ID</th>
              <th className="p-6 text-right">Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-inherit">
            {filteredEmployees.map((e) => (
              <tr
                key={e._id}
                className="hover:bg-blue-600/[0.03] transition-colors group"
              >
                <td className="p-6 font-bold flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 font-black text-[10px]">
                    {e.name.charAt(0)}
                  </div>
                  {e.name}
                </td>
                <td className="p-6 font-mono text-xs opacity-50 tracking-tighter">
                  {e.employeeId}
                </td>
                <td className="p-6 text-right">
                  <button
                    onClick={() => viewFullAnalytics(e)}
                    className="px-5 py-2 bg-slate-900 dark:bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider shadow-lg active:scale-95 transition-all"
                  >
                    Generate Report
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ATTENDANCE SPREAD SECTION */}
      <div className="grid grid-cols-1 gap-8 mb-10">
        <section
          className={`${cardBg} p-8 rounded-[2rem] border shadow-2xl overflow-hidden relative`}
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
          <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-10 opacity-60 flex items-center justify-between">
            <div className="flex gap-2 items-center"><FiActivity className="text-blue-500" /> Monthly Attendance Spread</div>
            <div className="flex items-center gap-2 bg-slate-500/10 p-1 px-3 rounded-xl border border-slate-500/20">
            <FiCalendar className="text-blue-500" />
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-transparent font-bold text-xs uppercase outline-none cursor-pointer"
            />
          </div>
          </h3>
          
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={attendanceSummary}
                margin={{ top: 20, right: 30, left: 0, bottom: 50 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={isDark ? "#334155" : "#e2e8f0"}
                />
                <XAxis
                  dataKey="employeeId"
                  interval={0}
                  tick={({ x, y, payload }) => {
                    const id = String(payload.value).trim();
                    const rawName = nameMap[id] || `User ${id}`; // Fallback to ID if name missing

                    // Truncate name: "Alexander" -> "Alex.."
                    const displayName =
                      rawName.length > 9
                        ? `${rawName.substring(0, 7)}..`
                        : rawName;

                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text
                          x={0}
                          y={0}
                          dy={16}
                          textAnchor="middle"
                          fill={isDark ? "#cbd5e1" : "#1e293b"}
                          fontSize={10}
                          fontWeight={800}
                        >
                          {displayName}
                        </text>
                        <text
                          x={0}
                          y={0}
                          dy={30}
                          textAnchor="middle"
                          fill={isDark ? "#94a3b8" : "#64748b"}
                          fontSize={9}
                          fontWeight={500}
                        >
                          {id}
                        </text>
                      </g>
                    );
                  }}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  label={{
                    value: "Days Present",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 10,
                    fontWeight: 900,
                  }}
                />
                <Tooltip
  cursor={{ fill: isDark ? "#1e293b" : "#f8fafc" }}
  contentStyle={{
    borderRadius: "16px",
    border: "none",
    backgroundColor: isDark ? "#1e293b" : "#fff",
    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
    color: isDark ? "#f1f5f9" : "#1e293b",
  }}
  // --- ADDED LOGIC BELOW ---
  labelFormatter={(value) => {
    // value here is the employeeId (the XAxis dataKey)
    const id = String(value).trim();
    const name = nameMap[id] || "User"; 
    return `${name} (${id})`; // Displays "John Doe (101)" at the top of the tooltip
  }}
  formatter={(value, name) => [
    `${value} Days`, 
    "Attendance"
  ]}
/>
                <Bar
                  dataKey="present"
                  name="Present Days"
                  radius={[8, 8, 0, 0]}
                  fill="#3b82f6"
                  barSize={35}
                >
                  <LabelList
                    dataKey="present"
                    position="top"
                    style={{
                      fontSize: "10px",
                      fontWeight: "bold",
                      fill: isDark ? "#fff" : "#000",
                    }}
                  />
                  {attendanceSummary.map((_, i) => (
                    <Cell key={i} fill={i % 2 === 0 ? "#3b82f6" : "#6366f1"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardLeaveWidget />
        <DashboardTaskWidget />
      </div>

      {/* DEEP AUDIT MODAL */}
      {details && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div
            className={`${
              isDark
                ? "bg-slate-900 border-slate-700"
                : "bg-white border-gray-200"
            } w-full max-w-6xl max-h-[95vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border animate-in zoom-in-95 duration-300`}
          >
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between p-8 border-b border-inherit bg-slate-500/5">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-blue-500/10 border-2 border-blue-500/20 p-1">
                  {details.employee.photo ? (
                    <img
                      src={`http://localhost:5000/uploads/${details.employee.photo}`}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <FiUsers className="w-full h-full p-3 opacity-30" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">
                    {details.employee.name}
                  </h3>
                  <p className="text-xs font-bold uppercase opacity-50 tracking-[0.2em]">
                    {details.employee.employeeId} • Monthly Performance Snapshot
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                >
                  <FiDownload /> Export Audit
                </button>
                <button
                  onClick={() => setDetails(null)}
                  className="p-3 rounded-full hover:bg-red-500/10 text-red-500 transition-colors bg-slate-500/10"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-16 no-scrollbar">
              {/* PIE METRICS ROW */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <MetricPie
                  title="Task Health"
                  data={[
                    {
                      name: "Pending",
                      value: details.tasks.filter((t) => t.status === "Pending")
                        .length,
                    },
                    {
                      name: "Progress",
                      value: details.tasks.filter(
                        (t) => t.status === "In Progress"
                      ).length,
                    },
                    {
                      name: "Done",
                      value: details.tasks.filter(
                        (t) => t.status === "Completed"
                      ).length,
                    },
                  ]}
                  colors={TASK_COLORS}
                />

                <MetricPie
                  title="Leave History"
                  data={[
                    {
                      name: "Approved",
                      value: details.leaves.filter(
                        (l) => l.status === "Approved"
                      ).length,
                    },
                    {
                      name: "Pending",
                      value: details.leaves.filter(
                        (l) => l.status === "Pending"
                      ).length,
                    },
                  ]}
                  colors={LEAVE_COLORS}
                />

                <MetricPie
                  title="Attendance Distribution"
                  data={[
                    {
                      name: "Present",
                      value: details.attendance.filter(
                        (a) => a.status === "PRESENT"
                      ).length,
                    },
                    {
                      name: "Absent",
                      value: Math.max(
                        22 -
                          details.attendance.filter(
                            (a) => a.status === "PRESENT"
                          ).length,
                        0
                      ),
                    },
                  ]}
                  colors={ATTENDANCE_COLORS}
                />
              </div>

              {/* TRIPLE LOG TABLES */}
              <div className="space-y-10 pb-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-6 bg-blue-600 rounded-full" />
                  <h4 className="text-sm font-black uppercase tracking-widest opacity-60">
                    Consolidated Activity Logs
                  </h4>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  <MiniAuditTable
                    title="Task Breakdown"
                    icon={<FiFileText className="text-yellow-500" />}
                    data={details.tasks}
                  />
                  <MiniAuditTable
                    title="Leave Registry"
                    icon={<FiCalendar className="text-emerald-500" />}
                    data={details.leaves}
                    type="leave"
                  />
                  <MiniAuditTable
                    title="Attendance Registry"
                    icon={<FiActivity className="text-blue-500" />}
                    data={details.attendance}
                    type="attendance"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= SUB-COMPONENTS ================= */

function MetricPie({ title, data, colors }) {
  return (
    <div className="flex flex-col items-center p-8 rounded-[2rem] bg-slate-500/5 border border-slate-500/10 shadow-inner group">
      <h4 className="text-[10px] font-black uppercase tracking-[0.25em] opacity-40 mb-6 group-hover:text-blue-500 transition-colors">
        {title}
      </h4>
      <div className="h-48 w-full">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={75}
              dataKey="value"
              stroke="none"
              paddingAngle={8}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-4 mt-6">
        {data.map((d, i) => (
          <div
            key={i}
            className="flex items-center gap-2 text-[9px] font-black uppercase tracking-tighter opacity-70"
          >
            <div
              className="w-2 h-2 rounded-full shadow-sm"
              style={{ background: colors[i] }}
            />{" "}
            {d.name}: {d.value}
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniAuditTable({ title, data, type = "task", icon }) {
  return (
    <div className="rounded-3xl border border-inherit overflow-hidden bg-slate-500/5 flex flex-col h-full">
      <div className="p-4 bg-slate-500/5 border-b border-inherit flex items-center gap-2 font-black text-[10px] uppercase tracking-widest opacity-60">
        {icon} {title}
      </div>
      <div className="flex-1 overflow-y-auto max-h-64 no-scrollbar">
        <table className="w-full text-[11px] text-left">
          <tbody className="divide-y divide-inherit">
            {data.length > 0 ? (
              data.map((item, i) => (
                <tr key={i} className="hover:bg-blue-500/5 transition-colors">
                  <td className="p-4 font-bold">
                    {type === "task"
                      ? item.title
                      : type === "leave"
                      ? `${item.leaveType} (${item.fromDate.slice(5)})`
                      : new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right font-black uppercase opacity-60">
                    <span
                      className={`px-2 py-0.5 rounded-md ${
                        item.status === "PRESENT" ||
                        item.status === "Completed" ||
                        item.status === "Approved"
                          ? "text-emerald-500 bg-emerald-500/10"
                          : "text-amber-500 bg-amber-500/10"
                      }`}
                    >
                      {type === "task"
                        ? item.status
                        : type === "leave"
                        ? item.status
                        : item.status === "PRESENT"
                        ? "Logged"
                        : "Absent"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="p-8 text-center opacity-30 italic">
                  No historical records.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
