import React, { useEffect, useState, useContext } from "react";
import {
  getTodayAttendance,
  getMyAttendance,
} from "../../utils/attendanceApi";
import { ThemeContext } from "../../context/ThemeContext";
import { FiCheckCircle, FiXCircle, FiClock, FiCalendar } from "react-icons/fi";

export default function AttendanceDashboard() {
  const { isDark } = useContext(ThemeContext);
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH DATA ================= */
  /**
   * Loads both today's specific attendance record and the full history.
   * Uses Promise.all for concurrent fetching to reduce load time.
   */
  const loadAttendance = async () => {
    try {
      setLoading(true);
      const [todayRes, historyRes] = await Promise.all([
        getTodayAttendance(),
        getMyAttendance(),
      ]);

      setToday(todayRes.data);
      // Ensure history is always an array to prevent .map errors
      setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
    } catch (err) {
      console.error("Attendance fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  // --- Dynamic Theme Styles ---
  const cardBg = isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100 shadow-sm";
  const textPrimary = isDark ? "text-slate-100" : "text-slate-800";
  const textMuted = isDark ? "text-slate-400" : "text-gray-500";

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center space-y-3 animate-pulse">
        <div className="w-full h-24 bg-slate-700/20 rounded-xl" />
        <div className="grid grid-cols-2 w-full gap-4">
          <div className="h-20 bg-slate-700/20 rounded-xl" />
          <div className="h-20 bg-slate-700/20 rounded-xl" />
        </div>
      </div>
    );
  }

  /* ================= CALCULATIONS ================= */
  const presentCount = history.filter((a) => a.status === "PRESENT").length;
  const absentCount = history.filter((a) => a.status === "ABSENT").length;
  const attendanceRate = history.length > 0 
    ? Math.round((presentCount / history.length) * 100) 
    : 0;

  return (
    <div className="space-y-6 transition-all duration-300 mt-9">
      
      {/* TODAY STATUS HERO CARD */}
      <div className={`p-6 rounded-2xl border ${cardBg} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${isDark ? "bg-blue-500/10" : "bg-blue-50"}`}>
            <FiClock className="text-blue-500 w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${textMuted}`}>Today's Status</h3>
            <p className={`text-xl font-black ${textPrimary}`}>
              {today?.status || "Attendance Not Marked"}
            </p>
          </div>
        </div>
        {today?.startTime && (
          <div className={`text-sm font-medium px-4 py-2 rounded-lg ${isDark ? "bg-slate-700" : "bg-gray-100"}`}>
            Punched in at: {new Date(today.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>

      {/* SUMMARY STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Present Card */}
        {/* <div className={`p-5 rounded-2xl border transition-transform hover:scale-[1.02] ${cardBg}`}>
          <div className="flex items-center gap-3 mb-2">
            <FiCheckCircle className="text-emerald-500" />
            <span className={`text-xs font-bold uppercase ${textMuted}`}>Present</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-black ${textPrimary}`}>{presentCount}</span>
            <span className="text-xs opacity-60">Days</span>
          </div>
        </div> */}

        {/* Absent Card */}
        {/* <div className={`p-5 rounded-2xl border transition-transform hover:scale-[1.02] ${cardBg}`}> */}
          {/* <div className="flex items-center gap-3 mb-2">
            <FiXCircle className="text-rose-500" />
            <span className={`text-xs font-bold uppercase ${textMuted}`}>Absent</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-black ${textPrimary}`}>{absentCount}</span>
            <span className="text-xs opacity-60">Days</span>
          </div>
        </div> */}

        {/* Attendance Rate Card */}
        {/* <div className={`p-5 rounded-2xl border transition-transform hover:scale-[1.02] ${cardBg}`}>
          <div className="flex items-center gap-3 mb-2">
            <FiTrendingUp className="text-blue-500" />
            <span className={`text-xs font-bold uppercase ${textMuted}`}>Reliability</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-black ${textPrimary}`}>{attendanceRate}%</span>
          </div>
        </div> */}
      </div>

      {/* HISTORY TABLE SECTION */}
      <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
        <div className="px-6 py-4 border-b border-inherit flex items-center gap-2">
          <FiCalendar className={textMuted} />
          <h3 className={`font-bold ${textPrimary}`}>Attendance Log</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className={`${isDark ? "bg-slate-700/50" : "bg-slate-50"} ${textMuted} uppercase text-[10px] tracking-widest`}>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold">Punch In</th>
                <th className="px-6 py-4 font-bold">Punch Out</th>
                <th className="px-6 py-4 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-slate-700" : "divide-gray-100"}`}>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="4" className={`px-6 py-10 text-center italic ${textMuted}`}>
                    No attendance records found for this period.
                  </td>
                </tr>
              ) : (
                history.map((record) => (
                  <tr key={record._id} className={`transition-colors ${isDark ? "hover:bg-slate-700/30" : "hover:bg-gray-50/50"}`}>
                    <td className={`px-6 py-4 font-medium ${textPrimary}`}>
                      {record.date}
                    </td>
                    <td className={`px-6 py-4 ${textMuted}`}>
                      {record.startTime ? new Date(record.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                    </td>
                    <td className={`px-6 py-4 ${textMuted}`}>
                      {record.endTime ? new Date(record.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter
                          ${record.status === "PRESENT" 
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                            : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                          }`}
                        >
                          {record.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * Internal helper for the Reliability Icon
 */
function FiTrendingUp({ className }) {
  return (
    <svg className={className} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="1em" width="1em">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  );
}