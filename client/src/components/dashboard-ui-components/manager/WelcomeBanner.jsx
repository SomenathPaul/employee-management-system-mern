// client/src/components/dashboard-ui-components/manager/WelcomeBanner.jsx
import React, { useContext, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // For tab navigation
import { ThemeContext } from "../../../context/ThemeContext";
import { FiCalendar, FiBell, FiBarChart2, FiArrowRight } from "react-icons/fi";

/**
 * WelcomeBanner Component
 * A high-impact hero section for the Manager Dashboard.
 * Includes dynamic greeting, current date, and quick-action navigation chips.
 */
export default function WelcomeBanner({ name }) {
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();

  // Memoized date to prevent recalculation on every render
  const today = useMemo(() => {
    return new Date().toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }, []);

  // --- Dynamic Styling Config ---
  const containerBg = isDark
    ? "bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-slate-100 border border-white/5"
    : "bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-600 text-white";

  // Glassmorphism effect for buttons/chips
  const glassAction = isDark
    ? "bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10"
    : "bg-black/10 hover:bg-black/20 backdrop-blur-sm border border-white/10";

  const subtleText = isDark ? "text-slate-400" : "text-blue-100";

  return (
    <motion.section
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`relative w-full rounded-3xl p-6 sm:p-8 md:p-10 overflow-hidden shadow-2xl ${containerBg}`}
    >
      {/* Abstract background decoration for a modern "Managerial" look */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          
          {/* --- LEFT SIDE: Greeting & Subtitle --- */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isDark ? "bg-blue-500/20 text-blue-400" : "bg-white/20 text-white"}`}>
                Management Suite
              </span>
            </div>
            
            <h1 className="font-bold leading-tight text-2xl sm:text-3xl md:text-4xl tracking-tight">
              Welcome back, <span className="capitalize">{name || "Manager"}</span>!
            </h1>

            <p className={`mt-3 text-sm sm:text-base max-w-xl font-medium opacity-90 ${subtleText}`}>
              Monitor employee productivity and manage stuffs from your central hub.
            </p>
          </div>

          {/* --- RIGHT SIDE: Quick Action Chips --- */}
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-3">
            
            {/* Date Display (Static) */}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all ${glassAction}`}>
              <FiCalendar className="w-4 h-4 text-blue-300" />
              <span>{today}</span>
            </div>

            {/* Navigation Button: Employee Analytics */}
            <button 
              onClick={() => navigate("/manager/employee-analytics-status")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95 group ${glassAction}`}
            >
              <FiBarChart2 className="w-5 h-5 text-emerald-400" />
              <span>Analytics</span>
              <FiArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>

            {/* Navigation Button: Notifications */}
            <button 
              onClick={() => navigate("/manager/notifications")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95 group ${glassAction}`}
            >
              <FiBell className="w-5 h-5 text-amber-400" />
              <span>Add Notification</span>
              <FiArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>

          </div>
        </div>
      </div>
    </motion.section>
  );
}