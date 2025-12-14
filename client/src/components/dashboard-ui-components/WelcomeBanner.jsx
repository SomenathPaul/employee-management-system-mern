// client/src/components/dashboard-ui-components/WelcomeBanner.jsx
import React, { useContext, useMemo } from "react";
import { motion } from "framer-motion";
import { ThemeContext } from "../../context/ThemeContext";
import { FiCalendar, FiClock, FiCheckCircle, FiTrendingUp } from "react-icons/fi";

export default function WelcomeBanner({ name }) {
  const { isDark } = useContext(ThemeContext);

  const today = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }, []);

  const containerBg = isDark
    ? "bg-gradient-to-r from-slate-800/80 via-slate-900 to-slate-800/90 text-slate-100"
    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white";

  const glass = isDark
    ? "bg-slate-800/60 backdrop-blur-sm border border-slate-700"
    : "bg-white/10";

  const chipBg = isDark ? "bg-slate-700/60 text-gray-100" : "bg-white/20 text-white";
  const subtle = isDark ? "text-slate-300" : "text-blue-100";

  return (
    <motion.section
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`w-full rounded-2xl p-4 sm:p-5 md:p-6 ${containerBg} shadow-lg`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">

          {/* LEFT SIDE */}
          <div className="flex-1 min-w-0">
            {/* Responsive Title */}
            <h1 className="font-semibold leading-tight text-lg sm:text-xl md:text-2xl">
              Welcome back, <span className="capitalize">{name || "there"}</span>
            </h1>

            {/* Subtitle */}
            <p className={`mt-1 sm:mt-2 text-xs sm:text-sm ${subtle}`}>
              Quick snapshot of your day & key updates.
            </p>

            {/* Small Chips */}
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-3">

              {/* Date Chip */}
              <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-full ${chipBg}`}>
                <FiCalendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-[10px] sm:text-xs font-medium">{today}</span>
              </div>

              {/* Next Meeting */}
              <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-full ${glass}`}>
                <FiClock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-300" />
                <div className="text-[10px] sm:text-xs">
                  <div className="font-medium leading-tight">Next Meeting</div>
                  <div className="text-[9px] sm:text-[11px] text-slate-300">2:30 PM • Zoom</div>
                </div>
              </div>

              {/* Tasks Due */}
              <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-full ${glass}`}>
                <FiCheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-300" />
                <div className="text-[10px] sm:text-xs">
                  <div className="font-medium leading-tight">Tasks</div>
                  <div className="text-[9px] sm:text-[11px] text-slate-300">5 due today</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE MINI-STATS */}
          <div className="w-full md:w-auto flex items-center justify-start md:justify-center">
            <div
              className={`p-3 sm:p-4 rounded-2xl ${glass} flex flex-col items-center justify-center min-w-[120px] sm:min-w-[140px]`}
            >
              <div className="text-lg sm:text-2xl md:text-3xl font-bold">+8%</div>
              <div className="text-[10px] sm:text-xs mt-1 text-slate-300 flex items-center gap-1.5 sm:gap-2">
                <FiTrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Productivity</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
