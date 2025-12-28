// client/src/components/dashboard-ui-components/manager/QuickLinksManager.jsx
import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { ThemeContext } from "../../../context/ThemeContext";
import { FiUsers, FiCheckSquare, FiCalendar, FiUser, FiArrowUpRight } from "react-icons/fi";

/**
 * Styling configuration for Managerial Quick Links.
 * Maps labels to specific gradient sets and icons for visual consistency.
 */
const LINK_CONFIG = {
  "Check Profiles": { 
    start: "from-blue-600", 
    end: "to-indigo-700", 
    icon: <FiUsers />,
    shadow: "shadow-blue-500/20" 
  },
  "View Tasks": { 
    start: "from-emerald-500", 
    end: "to-teal-700", 
    icon: <FiCheckSquare />,
    shadow: "shadow-emerald-500/20" 
  },
  "Check Leaves": { 
    start: "from-amber-400", 
    end: "to-orange-600", 
    icon: <FiCalendar />,
    shadow: "shadow-amber-500/20" 
  },
  Profile: { 
    start: "from-purple-500", 
    end: "to-violet-700", 
    icon: <FiUser />,
    shadow: "shadow-purple-500/20" 
  },
  default: { 
    start: "from-slate-500", 
    end: "to-slate-700", 
    icon: <FiArrowUpRight />,
    shadow: "shadow-slate-500/20" 
  },
};

export default function QuickLinksManager() {
  const { isDark } = useContext(ThemeContext);

  // Define the managerial navigation items
  const links = [
    { to: "/manager/employee-profiles", label: "Check Profiles", desc: "Profiles logs" },
    { to: "/manager/tasks", label: "View Tasks", desc: "Assignments" },
    { to: "/manager/employee-leave-requests", label: "Check Leaves", desc: "Approvals" },
    { to: "/manager/profile", label: "Profile", desc: "Personal" },
  ];

  // Dynamic container styling based on Dark Mode context
  const containerClass = isDark
    ? "rounded-2xl p-5 bg-slate-800/50 backdrop-blur-md border border-slate-700 shadow-xl"
    : "rounded-2xl p-5 bg-white border border-gray-100 shadow-lg shadow-slate-200/50";

  const subtitleClass = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <aside className={`${containerClass} transition-all duration-300`}>
      {/* --- Widget Header --- */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={`text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-slate-800"}`}>
            Management Portal
          </h3>
          <p className="text-xs text-slate-500 font-medium italic">Administrative shortcuts</p>
        </div>
        <div className="hidden sm:block">
          <span className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-wider">
            Actions Ready
          </span>
        </div>
      </div>

      {/* --- Link Grid ---
          Responsive settings: 
          - 1 col on small phones
          - 2 cols on tablets/desktops
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {links.map((l) => {
          const cfg = LINK_CONFIG[l.label] || LINK_CONFIG.default;

          return (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `
                relative group overflow-hidden flex flex-col p-4 rounded-xl transition-all duration-300
                bg-gradient-to-br ${cfg.start} ${cfg.end}
                ${isActive ? "ring-2 ring-offset-2 ring-blue-500 scale-[0.98]" : "hover:-translate-y-1 hover:shadow-2xl " + cfg.shadow}
              `}
            >
              {/* Decorative background visual depth */}
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />

              {/* Icon & Description Row */}
              <div className="flex items-start justify-between text-white mb-4">
                <div className="p-2.5 rounded-lg bg-white/20 backdrop-blur-md text-xl shadow-inner border border-white/10">
                  {cfg.icon}
                </div>
                <div className="text-[10px] font-bold uppercase opacity-60 group-hover:opacity-100 transition-opacity">
                  {l.desc}
                </div>
              </div>

              {/* Text Label Area */}
              <div className="text-white mt-auto">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm sm:text-base tracking-tight">{l.label}</span>
                  <FiArrowUpRight className="text-xs opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <div className="text-[10px] font-medium opacity-80 mt-0.5">
                  Manage <span className="underline decoration-white/30 underline-offset-2">{l.label.toLowerCase()}</span>
                </div>
              </div>
            </NavLink>
          );
        })}
      </div>

      {/* Mobile-only usage hint */}
      <div className={`mt-5 pt-4 border-t ${isDark ? 'border-white/5' : 'border-slate-100'} sm:hidden`}>
        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">
          Tap a tile to navigate
        </p>
      </div>
    </aside>
  );
}