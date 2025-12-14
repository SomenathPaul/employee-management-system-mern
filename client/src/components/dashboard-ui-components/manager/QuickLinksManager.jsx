import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { ThemeContext } from "../../../context/ThemeContext";

const BUTTON_STYLES = {
  "Attendance Status": { start: "#3b82f6", end: "#6366f1" },
  "Manage Tasks": { start: "#34d399", end: "#059669" },
  "Check Leaves": { start: "#fbbf24", end: "#fb923c" },
  Profile: { start: "#8b5cf6", end: "#4f46e5" },
  default: { start: "#d1d5db", end: "#9ca3af" },
};

export default function QuickLinksManager() {
  const { isDark } = useContext(ThemeContext);

  const links = [
    { to: "/manager/employee-attendance-status", label: "Attendance Status", desc: "View & Analysis" },
    { to: "/manager/tasks", label: "Manage Tasks", desc: "Open tasks" },
    { to: "/manager/employee-leave-requests", label: "Check Leaves", desc: "Manage & Approve" },
    { to: "/manager/profile", label: "Profile", desc: "View & edit" },
  ];

  const containerClass = isDark
    ? "rounded-xl p-4 bg-slate-800 border border-slate-700 text-slate-100 shadow-sm"
    : "rounded-xl p-4 bg-white border border-gray-100 text-slate-900 shadow-sm";

  const subtitleClass = isDark ? "text-slate-300" : "text-gray-500";

  return (
    <aside className={containerClass}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Quick Links</h3>
        <span className={`text-xs ${subtitleClass} hidden sm:block`}>Shortcuts</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {links.map((l) => {
          const style = BUTTON_STYLES[l.label] || BUTTON_STYLES.default;

          return (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `group flex items-center gap-3 p-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1
                 ${isActive ? "shadow-md scale-[1.01]" : "hover:scale-[1.02]"}`
              }
              style={{
                background: `linear-gradient(90deg, ${style.start}, ${style.end})`,
              }}
            >
              {/* Accent bar */}
              <span
                className="w-2 h-10 rounded-md shrink-0"
                style={{
                  background: `linear-gradient(180deg, ${style.start}, ${style.end})`,
                }}
                aria-hidden
              />

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm sm:text-base truncate text-white">
                    {l.label}
                  </span>
                  <span className={`text-xs ${subtitleClass} hidden sm:block`}>
                    {l.desc}
                  </span>
                </div>

                <div className="text-xs mt-1 text-white/90 truncate">
                  Quick access to <span className="font-medium">{l.label}</span>
                </div>
              </div>
            </NavLink>
          );
        })}
      </div>

      <div className={`mt-3 text-xs ${subtitleClass} sm:hidden`}>
        Tap a tile to open
      </div>
    </aside>
  );
}
