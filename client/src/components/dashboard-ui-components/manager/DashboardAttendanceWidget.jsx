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
  Cell,
} from "recharts";
import { ThemeContext } from "../../../context/ThemeContext";
import { FiUsers, FiArrowRight } from "react-icons/fi";

/**
 * Helper: Extracts YYYY-MM from an ISO date string
 */
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

  // Generate current month key to filter data
  const currentMonthKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    let cancelled = false;

    async function fetchAttendance() {
      try {
        setLoading(true);
        // API call to fetch all team attendance records
        const res = await api.get("/manager/attendance/all");
        const data = res?.data?.data || [];
        if (!cancelled) setRecords(data);
      } catch (err) {
        console.error("Attendance widget fetch error", err);
        if (!cancelled) setRecords([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAttendance();
    return () => (cancelled = true);
  }, []);

  /* ================= AGGREGATION LOGIC ================= */
  /**
   * Processes raw records into a percentage-based array for the chart.
   * Filters by current month and calculates: (Present / (Present + Absent)) * 100
   */
  const barData = useMemo(() => {
    const map = new Map();

    records.forEach((r) => {
      // Only process records for the current month
      if (monthKeyFromDateISO(r.date) !== currentMonthKey) return;

      const id = r.employeeId;
      if (!id) return;

      if (!map.has(id)) {
        map.set(id, {
          employeeName: r.employeeName,
          present: 0,
          absent: 0,
        });
      }

      if (r.status === "PRESENT") map.get(id).present++;
      else if (r.status === "ABSENT") map.get(id).absent++;
    });

    return [...map.values()]
      .map((e) => {
        const total = e.present + e.absent;
        return {
          name: e.employeeName.length > 12 ? e.employeeName.slice(0, 10) + ".." : e.employeeName,
          fullName: e.employeeName,
          pct: total ? Math.round((e.present / total) * 100) : 0,
        };
      })
      .sort((a, b) => b.pct - a.pct) // Show top performers first
      .slice(0, 5); // Limit to top 5 for widget clarity
  }, [records, currentMonthKey]);

  // --- Dynamic Styling Classes ---
  const cardBg = isDark 
    ? "bg-slate-800/50 backdrop-blur-md border border-slate-700 text-slate-100" 
    : "bg-white border border-gray-100 text-slate-900 shadow-sm";
  
  const mutedText = isDark ? "text-slate-400" : "text-gray-500";

  return (
    <div className={`p-5 rounded-2xl transition-all duration-300 ${cardBg}`}>
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
            <FiUsers size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider opacity-80">Attendance</h3>
            <p className="text-[10px] opacity-60">This Month's Top 5</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/manager/employee-analytics-status")}
          className="text-[10px] font-bold uppercase text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors"
        >
          Details <FiArrowRight />
        </button>
      </div>

      {/* CHART SECTION */}
      <div className="h-44 w-full">
        {loading ? (
          <div className="h-full flex items-center justify-center animate-pulse">
            <p className={`text-xs ${mutedText}`}>Syncing records...</p>
          </div>
        ) : barData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-40 italic">
            <FiUsers size={24} className="mb-2" />
            <p className="text-xs">No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#f1f5f9"} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 10, fontWeight: 600 }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                unit="%" 
                tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 10 }} 
              />
              <Tooltip 
                cursor={{ fill: isDark ? "#1e293b" : "#f8fafc" }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: isDark ? '#1e293b' : '#fff' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <Bar dataKey="pct" radius={[4, 4, 0, 0]} barSize={20}>
                {barData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.pct < 80 ? "#f43f5e" : "#3b82f6"} // Red if below 80%, else Blue
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* LIST VIEW SECTION */}
      {!loading && barData.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className={`text-[10px] font-black uppercase tracking-widest ${mutedText}`}>Performance Breakdown</h4>
          {barData.map((e, idx) => (
            <div key={idx} className="group">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold truncate max-w-[150px]">{e.fullName}</span>
                <span className={`font-black ${e.pct < 80 ? "text-rose-500" : "text-emerald-500"}`}>
                  {e.pct}%
                </span>
              </div>
              {/* Mini progress bar for list scannability */}
              <div className={`w-full h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden`}>
                <div 
                  className={`h-full transition-all duration-1000 ${e.pct < 80 ? "bg-rose-500" : "bg-emerald-500"}`}
                  style={{ width: `${e.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}