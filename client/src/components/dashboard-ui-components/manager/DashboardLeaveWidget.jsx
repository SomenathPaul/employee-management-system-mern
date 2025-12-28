import React, { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { ThemeContext } from "../../../context/ThemeContext";

/**
 * Global Status Color Configuration
 * Maps database statuses to semantic dashboard colors.
 */
const STATUS_COLORS = {
  Pending: "#f59e0b",   // Amber
  Approved: "#16a34a",  // Emerald
  Rejected: "#ef4444",  // Rose
  Expired: "#9ca3af",   // Gray/Slate
  Verified: "#00AEFF",     // Neutral
};

export default function DashboardLeaveWidget() {
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    let cancelled = false;

    async function fetchLeaves() {
      try {
        setLoading(true);
        // Attempt to hit the primary manager endpoint with a fallback
        let res;
        try {
          res = await api.get("/manager/leaves/getLeaves");
        } catch {
          res = await api.get("/manager/leaves");
        }

        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        if (!cancelled) setLeaves(data);
      } catch (err) {
        console.error("Dashboard leave fetch error:", err);
        if (!cancelled) setLeaves([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchLeaves();
    return () => (cancelled = true);
  }, []);

  /* ================= HELPERS ================= */
  /**
   * Logic to determine if a leave request is past its intended 'To Date'
   */
  const isExpired = (toDate) => {
    if (!toDate) return false;
    const today = new Date();
    const t = new Date(toDate);
    return t.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0);
  };

  /* ================= DATA PROCESSING ================= */
  // Transform flat array into aggregated counts for the Pie Chart
  const pieData = useMemo(() => {
    const map = {};
    leaves.forEach((l) => {
      const expired = isExpired(l.toDate);
      const status = expired && l.status === "Pending" ? "Expired" : l.status || "Other";
      map[status] = (map[status] || 0) + 1;
    });

    return Object.keys(map).map((k) => ({
      name: k,
      value: map[k],
    }));
  }, [leaves]);

  // Sort and limit to most recent applications
  const recentLeaves = useMemo(() => {
    return [...leaves]
      .sort((a, b) => new Date(b.appliedAt || b.createdAt || 0) - new Date(a.appliedAt || a.createdAt || 0))
      .slice(0, 4); // Limited to 4 for a compact widget feel
  }, [leaves]);

  // --- Dynamic Theme Styles ---
  const cardBg = isDark ? "bg-slate-800/50 backdrop-blur-md border border-slate-700 text-slate-100" : "bg-white border border-gray-100 text-slate-900 shadow-sm";
  const itemBg = isDark ? "bg-slate-700/40 hover:bg-slate-700/60" : "bg-gray-50 hover:bg-white";
  const mutedText = isDark ? "text-slate-400" : "text-gray-500";

  return (
    <div className={`p-5 rounded-2xl transition-all duration-300 ${cardBg}`}>
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider opacity-80">Team Leaves</h3>
          <p className="text-[10px] opacity-60">Status distribution & recents</p>
        </div>
        <button
          onClick={() => navigate("/manager/employee-leave-requests")}
          className="text-[10px] font-bold uppercase bg-blue-500/10 text-blue-500 px-2 py-1 rounded hover:bg-blue-500/20 transition-colors"
        >
          Details
        </button>
      </div>

      {/* PIE CHART SECTION */}
      <div className="h-44 relative flex items-center justify-center">
        {pieData.length === 0 && !loading ? (
          <div className={`text-xs italic ${mutedText}`}>No data recorded</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={45} // Creates a donut chart look
                outerRadius={65}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry) => (
                  <Cell 
                    key={entry.name} 
                    fill={STATUS_COLORS[entry.name] || STATUS_COLORS.Other} 
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '10px', fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
        {/* Center label for Donut */}
        <div className="absolute flex flex-col items-center">
          <span className="text-lg font-black">{leaves.length}</span>
          <span className="text-[8px] uppercase opacity-40 font-bold">Total</span>
        </div>
      </div>

      {/* MINI LEGEND */}
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mb-4">
        {pieData.map(d => (
          <div key={d.name} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLORS[d.name] }} />
            <span className="text-[9px] font-medium opacity-70">{d.name}</span>
          </div>
        ))}
      </div>

      {/* RECENT REQUESTS LIST */}
      <div className="space-y-1.5">
        <h4 className={`text-[10px] font-bold uppercase mb-2 ${mutedText}`}>Recent Activity</h4>
        {loading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2].map(i => <div key={i} className="h-8 bg-slate-700/20 rounded" />)}
          </div>
        ) : recentLeaves.length === 0 ? (
          <p className={`text-[10px] italic ${mutedText}`}>No recent requests</p>
        ) : (
          recentLeaves.map((l) => {
            const expired = isExpired(l.toDate);
            const status = expired && l.status === "Pending" ? "Expired" : l.status || "Other";

            return (
              <div
                key={l._id}
                className={`flex items-center justify-between p-2 rounded-xl transition-colors border border-transparent ${itemBg} ${isDark ? 'hover:border-slate-600' : 'hover:border-gray-200'}`}
              >
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-[11px] font-bold truncate">{l.name}</p>
                  <p className={`text-[9px] truncate ${mutedText}`}>{l.leaveType}</p>
                </div>

                <div 
                  className="px-2 py-0.5 rounded text-[9px] font-black uppercase text-white shadow-sm"
                  style={{ background: STATUS_COLORS[status] || STATUS_COLORS.Other }}
                >
                  {status}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}