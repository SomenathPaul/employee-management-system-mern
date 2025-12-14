// client/src/components/dashboard-ui-components/QuickLinks.jsx
import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";

const BUTTON_STYLES = {
  Attendance: { start: "#3b82f6", end: "#6366f1" },
  "My Tasks": { start: "#34d399", end: "#059669" },
  "My Leaves": { start: "#fbbf24", end: "#fb923c" },
  Profile: { start: "#8b5cf6", end: "#4f46e5" },
  default: { start: "#d1d5db", end: "#9ca3af" },
};

export default function QuickLinks() {
  const { isDark } = useContext(ThemeContext);

  const links = [
    { to: "/employee/attendance", label: "Attendance", desc: "Mark & view" },
    { to: "/employee/tasks", label: "My Tasks", desc: "Open tasks" },
    { to: "/employee/leave-requests", label: "My Leaves", desc: "Apply / history" },
    { to: "/employee/profile", label: "Profile", desc: "View & edit" },
  ];

  const containerClass = isDark
    ? "rounded-xl p-3 sm:p-4 bg-slate-800 border border-slate-700 text-slate-100 shadow-sm"
    : "rounded-xl p-3 sm:p-4 bg-white border border-gray-100 text-slate-900 shadow-sm";
  const subtitleClass = isDark ? "text-slate-300" : "text-gray-500";

  return (
    <aside className={containerClass}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Quick links</h3>
        <div className={`text-xs ${subtitleClass} hidden sm:block`}>Shortcuts</div>
      </div>

      {/* responsive grid: single column on xs, two columns on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {links.map((l) => {
          const style = BUTTON_STYLES[l.label] || BUTTON_STYLES.default;

          return (
            <NavLink
              key={l.to}
              to={l.to}
              aria-label={l.label}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 p-3 sm:p-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  isActive ? "shadow-md" : "hover:scale-[1.02]"
                }`
              }
              style={({ isActive }) => ({
                background: `linear-gradient(90deg, ${style.start} 0%, ${style.end} 100%)`,
                opacity: isActive ? 1 : 0.98,
              })}
            >
              {/* left accent bar - smaller on xs */}
              <span
                className="flex-none rounded-md"
                style={{
                  width: window.innerWidth < 640 ? 6 : 10,
                  height: window.innerWidth < 640 ? 36 : 40,
                  background: `linear-gradient(180deg, ${style.start}, ${style.end})`,
                }}
                aria-hidden
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between">
                  <div className="font-medium truncate text-sm sm:text-base">{l.label}</div>
                  {/* hide small desc on xs */}
                  <div className={`text-xs ${subtitleClass} hidden sm:block`}>{l.desc}</div>
                </div>
                <div className={`text-xs mt-1 ${isDark ? "text-slate-200/80" : "text-white/90"} truncate sm:truncate`}>
                  {/* on dark mode we keep lighter subtitle; on light mode the gradient is strong so we keep white text */}
                  <span className="hidden sm:inline">Quick access to </span>
                  <span className="font-medium">{l.label}</span>
                </div>
              </div>
            </NavLink>
          );
        })}
      </div>

      {/* small footer / hint for mobile */}
      <div className={`mt-3 text-xs ${subtitleClass} sm:hidden`}>Tap a tile to open</div>
    </aside>
  );
}
