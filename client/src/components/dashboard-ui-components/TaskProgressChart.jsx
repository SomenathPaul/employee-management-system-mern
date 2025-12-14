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

// Light / Dark color palette
const LIGHT_COLORS = ["#60A5FA", "#FBBF24", "#34D399", "#F87171", "#A78BFA"];
const DARK_COLORS = ["#60A5FA", "#FBBF24", "#34D399", "#F87171", "#A78BFA"]; // choose darker palette if you want

// Draw custom triangular bar shape
const getPath = (x, y, width, height) =>
  `M${x},${y + height}
   C${x + width / 3},${y + height} 
    ${x + width / 2},${y + height / 3} 
    ${x + width / 2},${y}
   C${x + width / 2},${y + height / 3} 
    ${x + (2 * width) / 3},${y + height} 
    ${x + width},${y + height}
   Z`;

function TriangleBar(props) {
  const { fill, x, y, width, height } = props;
  if (x == null || y == null || width == null || height == null) return null;
  return <path d={getPath(x, y, width, height)} fill={fill} stroke="none" />;
}

export default function TaskProgressChart() {
  const { isDark } = useContext(ThemeContext);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // choose palette (you can customize dark colors)
  const palette = isDark ? DARK_COLORS : LIGHT_COLORS;

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get("/manager/tasks/employee/me");
        const tasks = Array.isArray(res.data) ? res.data : res.data?.data || [];

        // Count tasks grouped by status
        const counts = tasks.reduce((acc, t) => {
          const s = t.status || "Pending";
          acc[s] = (acc[s] || 0) + 1;
          return acc;
        }, {});

        // Ensure a stable ordering if you prefer (Pending, In Progress, Completed, Cancelled)
        const order = ["Pending", "In Progress", "Completed", "Cancelled", "Blocked"];
        const keys = Object.keys(counts).sort((a, b) => {
          const ia = order.indexOf(a) === -1 ? 999 : order.indexOf(a);
          const ib = order.indexOf(b) === -1 ? 999 : order.indexOf(b);
          return ia - ib;
        });

        const formatted = keys.map((status, idx) => ({
          status,
          count: counts[status],
          color: palette[idx % palette.length],
        }));

        if (!cancelled) setChartData(formatted);
      } catch (err) {
        console.error("task chart fetch error:", err);
        if (!cancelled) setChartData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => {
      cancelled = true;
    };
  }, [isDark]);

  const total = chartData.reduce((s, d) => s + d.count, 0);

  return (
    <div
      className={`rounded-xl shadow-sm p-4 ${
        isDark
          ? "bg-slate-800 border border-slate-700 text-slate-200"
          : "bg-white border border-gray-100 text-slate-900"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold">Tasks — Status Overview</h3>
      </div>

      {loading ? (
        <div className={`w-full h-40 flex items-center justify-center ${isDark ? "text-slate-400" : "text-gray-500"}`}>
          Loading…
        </div>
      ) : chartData.length === 0 ? (
        <div className={`w-full h-40 flex flex-col items-center justify-center gap-2 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
          <div className="text-sm font-medium">No tasks available</div>
          <div className="text-xs">You have no assigned tasks right now.</div>
        </div>
      ) : (
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e6edf3"} />
              <XAxis dataKey="status" tick={{ fill: isDark ? "#cbd5e1" : "#374151" }} />
              <YAxis tick={{ fill: isDark ? "#cbd5e1" : "#374151" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: isDark ? "#0f1724" : "#fff",
                  border: `1px solid ${isDark ? "#1f2937" : "#e5e7eb"}`,
                  color: isDark ? "#e5e7eb" : "#111827",
                  borderRadius: 6,
                }}
              />
              <Legend verticalAlign="top" height={36} />

              <Bar
                dataKey="count"
                name="Tasks"
                shape={TriangleBar}
                label={{ position: "top", fill: isDark ? "#e2e8f0" : "#111827", fontSize: 12 }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Total badge */}
      <div className="mt-3 flex items-center justify-center">
        <div
          className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium ${
            isDark ? "bg-slate-700/60 text-slate-100" : "bg-gray-100 text-gray-900"
          }`}
        >
          <span className="mr-2 text-xs opacity-80">Total</span>
          <span className="text-lg font-semibold">{total} Tasks</span>
        </div>
      </div>
    </div>
  );
}
