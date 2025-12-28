// client/src/components/dashboard-ui-components/WelcomeBanner.jsx
import React, { useContext, useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../utils/api";
import { ThemeContext } from "../../context/ThemeContext";
import { 
  FiCalendar, 
  FiClock, 
  FiCheckCircle, 
  FiTrendingUp, 
  FiAlertCircle 
} from "react-icons/fi";
import { getMyAttendance, getTodayAttendance } from "../../utils/attendanceApi";

export default function WelcomeBanner({ name }) {
  const { isDark } = useContext(ThemeContext);

  // --- STATE MANAGEMENT ---
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [pendingTaskCount, setPendingTaskCount] = useState(0);
  const [loading, setLoading] = useState(true);
  // for productivity
  const [completedTaskCount, setCompletedTaskCount] = useState(0);
const [totalTaskCount, setTotalTaskCount] = useState(0);


  // --- DATE CALCULATION ---
  const todayDate = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }, []);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Run both API calls in parallel for better performance
        const [attendanceRes, taskRes] = await Promise.all([
          getTodayAttendance(),
          api.get("/manager/tasks/employee/me")
        ]);

        // Set Attendance Data
        if (attendanceRes?.data) {
          setTodayAttendance(attendanceRes.data);
        }

        // Set Task Data
        const tasks = taskRes.data?.data || [];

const completed = tasks.filter(
  t => t.status === "Completed"
).length;

setTotalTaskCount(tasks.length);
setCompletedTaskCount(completed);
setPendingTaskCount(tasks.length - completed);


      } catch (error) {
        console.error("Dashboard Banner Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const productivity = useMemo(() => {
  if (totalTaskCount === 0) return 0;
  return Math.round((completedTaskCount / totalTaskCount) * 100);
}, [completedTaskCount, totalTaskCount]);


  // --- DYNAMIC STYLING ---
  const containerBg = isDark
    ? "bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-slate-100 border border-slate-700/50"
    : "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white";

  const glass = isDark
    ? "bg-white/5 backdrop-blur-md border border-white/10"
    : "bg-white/20 backdrop-blur-md border border-white/30";

  const chipBg = isDark ? "bg-slate-700/60 text-gray-100" : "bg-black/10 text-white";
  const subtle = isDark ? "text-slate-400" : "text-blue-100";

  return (
    <motion.section
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`w-full rounded-3xl p-5 sm:p-6 md:p-8 ${containerBg} shadow-2xl relative overflow-hidden`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/10 rounded-full -ml-12 -mb-12 blur-2xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="flex-1 min-w-0">
            <h1 className="font-bold leading-tight text-xl sm:text-2xl md:text-3xl tracking-tight">
              Welcome back, <span className="capitalize">{name?.split(' ')[0] || "there"}</span> 👋
            </h1>

            <p className={`mt-2 text-xs sm:text-sm font-medium ${subtle}`}>
              Here's what's happening with your workflow today.
            </p>

            <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${chipBg}`}>
                <FiCalendar className="w-4 h-4" />
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">{todayDate}</span>
              </div>

              {/* Attendance Status Chip */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${glass}`}>
                <FiClock className={`w-4 h-4 ${todayAttendance?.status === 'PRESENT' ? 'text-green-400' : 'text-amber-400'}`} />
                <div className="text-[11px] sm:text-xs">
                  <span className="opacity-70 block text-[9px] uppercase font-bold">Attendance</span>
                  <span className="font-bold">
                    {loading ? "..." : (todayAttendance?.status || "Not Marked")}
                  </span>
                </div>
              </div>

              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${glass}`}>
                {pendingTaskCount > 0 ? (
                  <FiAlertCircle className="w-4 h-4 text-red-400 animate-pulse" />
                ) : (
                  <FiCheckCircle className="w-4 h-4 text-green-400" />
                )}
                <div className="text-[11px] sm:text-xs">
                  <span className="opacity-70 block text-[9px] uppercase font-bold">Active Tasks</span>
                  <span className="font-bold">{loading ? "..." : pendingTaskCount} Assigned</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto flex items-center">
            <div className={`p-4 sm:p-5 rounded-3xl ${glass} flex flex-col items-center justify-center min-w-[140px] shadow-inner group transition-all hover:scale-105`}>
              <div className="text-2xl sm:text-3xl font-black tracking-tighter text-blue-400 group-hover:text-blue-300 transition-colors">
                {loading ? "..." : `${productivity}%`}
              </div>
              <div className="text-[10px] sm:text-xs mt-1 font-bold opacity-80 uppercase tracking-widest flex items-center gap-2">
                <FiTrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Productivity</span>
              </div>
              <div className="mt-2 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 w-[70%] rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}