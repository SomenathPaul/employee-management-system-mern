// client/src/components/dashboard-page-components/DashboardSidebar.jsx
import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import {
  MdDashboard,
  MdPerson,
  MdAccessTime,
  MdAssignment,
  MdMessage,
  MdSettings,
  MdNotifications,
  MdLogout,
  MdRequestPage,
} from "react-icons/md";
import { FaUserCog } from "react-icons/fa";
import { GrUserManager } from "react-icons/gr";

import { ThemeContext } from "../../context/ThemeContext";
import { NotificationContext } from "../../context/NotificationContext";
import { MessageContext } from "../../context/MessageContext";
import { TaskContext } from "../../context/TaskContext";

/**
 * Common styles for Sidebar Links
 * Handles Active vs Inactive states and Dark/Light theme hover effects.
 */
const getLinkStyles = (isActive, isDark) => `
  group flex items-center gap-3 px-3 sm:px-5 py-2.5 rounded-xl transition-all duration-200
  ${isActive 
    ? "bg-blue-600/15 text-blue-600 font-bold border-l-4 border-blue-600" 
    : isDark 
      ? "text-slate-400 hover:bg-white/5 hover:text-white" 
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }
`;

/**
 * Sidebar Component for the Employee Role
 */
function DashboardSidebar({ user }) {
  const navUser = user.toLowerCase();
  const { isDark } = useContext(ThemeContext);
  
  // Badge Data from Contexts
  const { unreadCount } = useContext(NotificationContext);
  const { unreadMessages } = useContext(MessageContext);
  const { pendingTasks } = useContext(TaskContext);

  const items = [
    { name: "Dashboard", icon: <MdDashboard />, path: `/${navUser}/dashboard` },
    { name: "My Profile", icon: <MdPerson />, path: `/${navUser}/profile` },
    { name: "Progress", icon: <MdAccessTime />, path: `/${navUser}/progress` },
    { name: "Leave Requests", icon: <MdRequestPage />, path: `/${navUser}/leave-requests` },
    { name: "Tasks / Projects", icon: <MdAssignment />, path: `/${navUser}/tasks` },
    { name: "Messages", icon: <MdMessage />, path: `/${navUser}/messages` },
    { name: "Settings", icon: <MdSettings />, path: `/${navUser}/settings` },
    { name: "Notifications", icon: <MdNotifications />, path: `/${navUser}/notifications` },
    { name: "Logout", icon: <MdLogout />, path: `/${navUser}/logout` },
  ];

  return (
    <aside className={`h-full w-full flex flex-col justify-between items-start shadow-xl border-r-2 transition-colors duration-300 
      ${isDark ? "bg-slate-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-800"}`}>
      
      <div className="w-full px-2 sm:px-4">
        {/* Branding Area: Full name on desktop, Initial on mobile */}
        <div className={`flex items-center justify-start py-6 px-4 mb-4 border-b w-full ${isDark ? "border-white/10" : "border-slate-100"}`}>
          <span className="text-2xl font-black tracking-tighter text-blue-600">
            <span className="hidden sm:inline italic">HRly</span>
            <span className="inline sm:hidden">H</span>
          </span>
        </div>

        {/* Navigation List */}
        <ul className="flex flex-col gap-1.5 w-full">
          {items.map((item, index) => (
            <li key={index} className="w-full">
              <NavLink to={item.path} className={({ isActive }) => getLinkStyles(isActive, isDark)}>
                <span className="relative text-xl flex-shrink-0">
                  {item.icon}
                  {/* Badge Logic for Notifications/Messages/Tasks */}
                  <NotificationBadge 
                    count={
                      item.name === "Notifications" ? unreadCount : 
                      item.name === "Messages" ? unreadMessages : 
                      item.name === "Tasks / Projects" ? pendingTasks : 0
                    } 
                    color={item.name === "Messages" ? "bg-blue-600" : item.name === "Tasks / Projects" ? "bg-amber-500 text-black" : "bg-red-600"}
                  />
                </span>
                <span className="text-sm hidden sm:inline truncate">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer Branding */}
      <div className={`text-left text-[10px] uppercase tracking-widest p-5 border-t w-full opacity-40 font-bold ${isDark ? "border-white/10" : "border-slate-100"}`}>
        <span className="hidden sm:inline">© 2025 HRly Platform</span>
        <span className="inline sm:hidden">©25</span>
      </div>
    </aside>
  );
}

/**
 * Sidebar Component for the Manager Role
 * Organized into logical sections for Employee Management vs Profile Management
 */
export function DashboardSidebarManager({ user }) {
  const navUser = user.toLowerCase();
  const { isDark } = useContext(ThemeContext);

  const emp_items = [
    { name: "Activity", icon: <MdDashboard />, path: `/${navUser}/dashboard` },
    { name: "Profiles", icon: <MdPerson />, path: `/${navUser}/employee-profiles` },
    { name: "Analytics", icon: <MdAccessTime />, path: `/${navUser}/employee-analytics-status` },
    { name: "Requests", icon: <MdRequestPage />, path: `/${navUser}/employee-leave-requests` },
    { name: "Tasks", icon: <MdAssignment />, path: `/${navUser}/tasks` },
    { name: "Messages", icon: <MdMessage />, path: `/${navUser}/messages` },
    { name: "Alerts", icon: <MdNotifications />, path: `/${navUser}/notifications` },
  ];

  const manager_items = [
    { name: "My Profile", icon: <MdPerson />, path: `/${navUser}/profile` },
    { name: "Settings", icon: <MdSettings />, path: `/${navUser}/settings` },
    { name: "Logout", icon: <MdLogout />, path: `/${navUser}/logout` },
  ];

  return (
    <aside className={`h-full w-full flex flex-col justify-between items-start shadow-xl border-r-2 transition-colors duration-300
      ${isDark ? "bg-slate-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-800"}`}>
      
      <div className="w-full px-2 sm:px-4 overflow-y-auto no-scrollbar">
        {/* Branding Area */}
        <div className={`flex items-center justify-start p-4 mb-4 border-b w-full ${isDark ? "border-white/10" : "border-slate-100"}`}>
          <span className="text-2xl font-black tracking-tighter text-blue-600 uppercase">
            <span className="hidden sm:inline">HRly Manager</span>
            <span className="inline sm:hidden">M</span>
          </span>
        </div>

        {/* --- Employee Management Section --- */}
        <SectionHeader label="Manage Staff" icon={<FaUserCog />} isDark={isDark} />
        <ul className="flex flex-col gap-0.5 w-full mb-6">
          {emp_items.map((item, index) => (
            <li key={index} className="w-full">
              <NavLink to={item.path} className={({ isActive }) => getLinkStyles(isActive, isDark)}>
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <span className="text-sm hidden sm:inline">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* --- Personal Profile Section --- */}
        <SectionHeader label="My Account" icon={<GrUserManager />} isDark={isDark} />
        <ul className="flex flex-col gap-0.5 w-full">
          {manager_items.map((item, index) => (
            <li key={index} className="w-full">
              <NavLink to={item.path} className={({ isActive }) => getLinkStyles(isActive, isDark)}>
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <span className="text-sm hidden sm:inline">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Sidebar Footer */}
      <div className={`text-left text-[10px] uppercase tracking-widest p-5 border-t w-full opacity-40 font-bold ${isDark ? "border-white/10" : "border-slate-100"}`}>
        <span className="hidden sm:inline">© 2025 Manager Suite</span>
        <span className="inline sm:hidden">©25</span>
      </div>
    </aside>
  );
}

// --- Internal Helper Components ---

/**
 * Section Header Pill: Labels sections on desktop, shows icon on mobile rail
 */
const SectionHeader = ({ label, icon, isDark }) => (
  <div className={`flex items-center gap-2 px-4 py-2 mb-2 rounded-lg 
    ${isDark ? "bg-white/5 text-slate-400" : "bg-slate-50 text-slate-500"}`}>
    <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">{label}</span>
    <span className="sm:hidden text-lg">{icon}</span>
  </div>
);

/**
 * Notification Badge: Displays a colored bubble with counts
 */
const NotificationBadge = ({ count, color }) => {
  if (count <= 0) return null;
  return (
    <span className={`absolute -top-1 -right-1 ${color} text-white text-[9px] font-bold rounded-full px-1.5 h-4 min-w-[16px] flex items-center justify-center`}>
      {count > 9 ? '9+' : count}
    </span>
  );
};

export default DashboardSidebar;