// client/src/components/dashboard-ui-components/TaskProgressChart.jsx
import React, { useEffect, useState, useContext } from "react";
import api from "../../utils/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from "recharts";
import { ThemeContext } from "../../context/ThemeContext";

/**
 * STATUS_COLORS
 * Maps task statuses to semantic colors for visual consistency.
 */
const STATUS_COLORS = {
  Pending: "#FBBF24",     // Amber-400
  "In Progress": "#60A5FA", // Blue-400
  Completed: "#34D399",   // Emerald-400
  Cancelled: "#F87171",   // Red-400
  Blocked: "#A78BFA",     // Violet-400
  Default: "#94A3B8",     // Slate-400
};

/**
 * getPath
 * Generates an SVG path for a stylized "Triangle Bar" with curved tops.
 */
const getPath = (x, y, width, height) =>
  `M${x},${y + height}
   C${x + width / 3},${y + height} 
    ${x + width / 2},${y + height / 3} 
    ${x + width / 2},${y}
   C${x + width / 2},${y + height / 3} 
    ${x + (2 * width) / 3},${y + height} 
    ${x + width},${y + height}
   Z`;

/**
 * TriangleBar
 * Custom shape component for Recharts Bar.
 */
const TriangleBar = (props) => {
  const { fill, x, y, width, height } = props;
  if (x == null || y == null || width == null || height == null) return null;
  return <path d={getPath(x, y, width, height)} fill={fill} stroke="none" />;
};

export default function TaskProgressChart() {
  const { isDark } = useContext(ThemeContext);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchTaskAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.get("/manager/tasks/employee/me");
        const tasks = Array.isArray(res.data) ? res.data : res.data?.data || [];

        // Step 1: Count tasks grouped by status using a frequency map
        const counts = tasks.reduce((acc, t) => {
          const s = t.status || "Pending";
          acc[s] = (acc[s] || 0) + 1;
          return acc;
        }, {});

        // Step 2: Define strict sort order for the X-Axis
        const order = ["Pending", "In Progress", "Completed", "Blocked", "Cancelled"];
        
        // Step 3: Format data for Recharts
        const formatted = order
          .filter(status => counts[status] !== undefined) // Only show statuses that exist
          .map(status => ({
            status,
            count: counts[status],
            color: STATUS_COLORS[status] || STATUS_COLORS.Default,
          }));

        if (!cancelled) setChartData(formatted);
      } catch (err) {
        console.error("Task chart analytics error:", err);
        if (!cancelled) setChartData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTaskAnalytics();
    return () => { cancelled = true; };
  }, []);

  const total = chartData.reduce((s, d) => s + d.count, 0);

  return (
    <div
      className={`rounded-2xl shadow-xl p-6 transition-all duration-300 ${
        isDark
          ? "bg-slate-800/50 backdrop-blur-md border border-slate-700 text-slate-100"
          : "bg-white border border-gray-100 text-slate-900"
      }`}
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-lg font-bold tracking-tight">Task Analytics</h3>
          <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>
            Distribution of tasks by current status
          </p>
        </div>
        
        {/* Total Count Badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-bold border self-start ${
          isDark ? "bg-slate-700/50 border-slate-600" : "bg-blue-50 border-blue-100 text-blue-600"
        }`}>
          {total} Total Tasks
        </div>
      </div>

      {/* Chart Container */}
      <div className="w-full h-72 sm:h-80 md:h-96">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center animate-pulse">
            <div className="flex flex-col items-center gap-2">
              <div className={`w-12 h-12 rounded-full border-4 border-t-blue-500 animate-spin ${isDark ? "border-slate-700" : "border-gray-200"}`} />
              <span className="text-sm font-medium opacity-50">Syncing Data...</span>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center opacity-60">
            <div className="p-4 bg-gray-100 dark:bg-slate-700 rounded-full mb-3 text-2xl">📋</div>
            <p className="font-semibold text-sm">No Active Assignments</p>
            <p className="text-xs">New tasks will appear here once assigned.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid 
                vertical={false} 
                strokeDasharray="3 3" 
                stroke={isDark ? "#334155" : "#F1F5F9"} 
              />
              <XAxis 
                dataKey="status" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDark ? "#94A3B8" : "#64748B", fontSize: 11, fontWeight: 500 }} 
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDark ? "#94A3B8" : "#64748B", fontSize: 11 }} 
                allowDecimals={false} 
              />
              <Tooltip
                cursor={{ fill: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)" }}
                contentStyle={{
                  background: isDark ? "#1E293B" : "#FFF",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
                itemStyle={{ fontWeight: "bold" }}
              />
              <Bar
                dataKey="count"
                name="Tasks"
                shape={<TriangleBar />}
                animationDuration={1500}
                animationEasing="ease-in-out"
                label={{ 
                  position: "top", 
                  fill: isDark ? "#F8FAFC" : "#1E293B", 
                  fontSize: 13, 
                  fontWeight: "bold",
                  formatter: (val) => val > 0 ? val : ""
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend Footnote */}
      {!loading && chartData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700/20 flex flex-wrap justify-center gap-4">
          {chartData.map((d, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">{d.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}