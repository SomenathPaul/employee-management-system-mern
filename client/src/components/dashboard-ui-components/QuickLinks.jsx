// client/src/components/dashboard-ui-components/QuickLinks.jsx
import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
// Icons add a professional touch and help with quick recognition
import { FiUser, FiCalendar, FiCheckSquare, FiClock, FiChevronRight } from "react-icons/fi";

/**
 * Styling configuration for the QuickLink tiles.
 * Each key corresponds to the link label.
 */
const LINK_CONFIG = {
  Progress: { 
    start: "from-blue-600", 
    end: "to-indigo-700", 
    icon: <FiClock />,
    shadow: "shadow-blue-500/20"
  },
  "My Tasks": { 
    start: "from-emerald-500", 
    end: "to-teal-700", 
    icon: <FiCheckSquare />,
    shadow: "shadow-emerald-500/20"
  },
  "My Leaves": { 
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
    icon: <FiChevronRight />,
    shadow: "shadow-slate-500/20"
  },
};

export default function QuickLinks() {
  const { isDark } = useContext(ThemeContext);

  const links = [
    { to: "/employee/progress", label: "Progress", desc: "Check analytics" },
    { to: "/employee/tasks", label: "My Tasks", desc: "Manage work" },
    { to: "/employee/leave-requests", label: "My Leaves", desc: "Request time" },
    { to: "/employee/profile", label: "Profile", desc: "User settings" },
  ];

  // Dynamic container styling based on theme
  const containerClass = isDark
    ? "rounded-2xl p-5 bg-slate-800/50 backdrop-blur-md border border-slate-700 shadow-xl"
    : "rounded-2xl p-5 bg-white border border-gray-100 shadow-lg shadow-slate-200/50";

  return (
    <section className={`${containerClass} transition-all duration-300`}>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={`text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-slate-800"}`}>
            Quick Actions
          </h3>
          <p className="text-xs text-slate-500 font-medium">Frequent navigation shortcuts</p>
        </div>
        <div className="hidden sm:block">
          <span className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-wider">
            Ready
          </span>
        </div>
      </div>

      {/* Grid Responsiveness:
          - 1 column on mobile (grid-cols-1)
          - 2 columns on small tablets (sm:grid-cols-2)
          - 4 columns on large desktops (2xl:grid-cols-4)
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4">
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
              {/* Decorative background circle for visual depth */}
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />

              <div className="flex items-start justify-between text-white">
                <div className="p-2 rounded-lg bg-white/20 backdrop-blur-md text-xl mb-3 shadow-inner">
                  {cfg.icon}
                </div>
                <FiChevronRight className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>

              <div className="text-white mt-auto">
                <div className="font-bold text-base tracking-tight">{l.label}</div>
                <div className="text-[11px] font-medium opacity-80 mt-0.5 leading-tight">
                  {l.desc}
                </div>
              </div>
            </NavLink>
          );
        })}
      </div>

      {/* Footer hint for Mobile UX */}
      <div className="mt-5 pt-4 border-t border-slate-500/10 sm:hidden">
        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Tap to navigate
        </p>
      </div>
    </section>
  );
}