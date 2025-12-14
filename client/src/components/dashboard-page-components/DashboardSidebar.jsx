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

import { ThemeContext } from "../../context/ThemeContext";

function DashboardSidebar({ user }) {
  let navUser = user.toLowerCase();
  const items = [
    { name: "Dashboard", icon: <MdDashboard />, path: `/${navUser}/dashboard` },
    { name: "My Profile", icon: <MdPerson />, path: `/${navUser}/profile` },
    { name: "Attendance", icon: <MdAccessTime />, path: `/${navUser}/attendance` },
    { name: "Leave Requests", icon: <MdRequestPage />, path: `/${navUser}/leave-requests` },
    { name: "Tasks / Projects", icon: <MdAssignment />, path: `/${navUser}/tasks` },
    { name: "Messages", icon: <MdMessage />, path: `/${navUser}/messages` },
    { name: "Settings", icon: <MdSettings />, path: `/${navUser}/settings` },
    { name: "Notifications", icon: <MdNotifications />, path: `/${navUser}/notifications` },
    { name: "Logout", icon: <MdLogout />, path: `/${navUser}/logout` },
  ];

  const { isDark } = useContext(ThemeContext);

  return (
    <div
      className={`h-full w-full ${
        isDark ? "bg-app text-app border-white/20" : "bg-app text-app border-gray-300"
      } text-black flex flex-col justify-between items-start shadow-lg px-3 sm:px-5 border-r-2`}
    >
      {/* Logo / Title - keep same look on desktop, compact on small */}
      <div className="flex items-left justify-start py-5 text-2xl font-bold border-b border-white/20 w-full">
        {/* show short label on very small screens to save space */}
        <span className="hidden sm:inline">HRly</span>
        <span className="inline sm:hidden">H</span>
      </div>

      {/* Sidebar Items */}
      {/* on small screens we make this an icon rail: center icons and hide labels */}
      <ul className="flex flex-col gap-3 w-full mt-4">
        {items.map((item, index) => (
          <li key={index} className="w-full">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 sm:px-5 py-2 rounded-md transition-all duration-300
                  ${isDark ? "hover:bg-white/20" : ""}
                  ${
                    isActive
                      ? "bg-white/10 text-blue-600 font-semibold"
                      : "hover:bg-black/20"
                  }`
              }
            >
              {/* Icon: always visible. center on small screens */}
              <span className="text-lg flex-shrink-0 w-6 h-6 flex items-center justify-center">
                {item.icon}
              </span>

              {/* Label: hidden on small screens (sm+) */}
              <span className="text-sm hidden sm:inline">{item.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Footer / Version */}
      <div className="text-left text-xs p-4 border-t border-white/20 w-full">
        <span className="hidden sm:inline">© 2025 HRly</span>
        <span className="inline sm:hidden text-xs">©25</span>
      </div>
    </div>
  );
}

import { FaUserCog } from "react-icons/fa";
import { GrUserManager } from "react-icons/gr";

export function DashboardSidebarManager({ user }) {
  let navUser = user.toLowerCase();
  const emp_items = [
    { name: "Dashboard Activity", icon: <MdDashboard />, path: `/${navUser}/dashboard` },
    { name: "Employee Profiles", icon: <MdPerson />, path: `/${navUser}/employee-profiles` },
    { name: "Attendance Summary", icon: <MdAccessTime />, path: `/${navUser}/employee-attendance-status` },
    { name: "Leave Requests Status", icon: <MdRequestPage />, path: `/${navUser}/employee-leave-requests` },
    { name: "Tasks Manager", icon: <MdAssignment />, path: `/${navUser}/tasks` },
    { name: "Check Messages", icon: <MdMessage />, path: `/${navUser}/messages` },
    { name: "Notifications", icon: <MdNotifications />, path: `/${navUser}/notifications` },
  ];
  const manager_items = [
    { name: "Profile", icon: <MdPerson />, path: `/${navUser}/profile` },
    { name: "Settings", icon: <MdSettings />, path: `/${navUser}/settings` },
    { name: "Logout", icon: <MdLogout />, path: `/${navUser}/logout` },
  ];

  const { isDark } = useContext(ThemeContext);

  return (
    <div
      className={`h-full w-full ${
        isDark ? "bg-app text-app border-gray-700" : "bg-app text-app border-gray-300"
      } text-black flex flex-col justify-between items-start shadow-lg px-3 sm:px-5 border-r-2`}
    >
      {/* Logo / Title */}
      <div className="flex items-left justify-start py-5 text-2xl font-bold w-full">
        <span className="hidden sm:inline">HRly</span>
        <span className="inline sm:hidden">H</span>
      </div>

      {/* Employee management section */}
      <div className="w-full">
        <p className={`border-b-2 ml-0 sm:ml-1 mt-2 py-2 px-2 ${isDark ? "bg-blue-900/50 text-app" : "bg-gray-100 text-app"}`}>
          <span className="hidden sm:inline">Manage Employee</span>
          <span className="inline sm:hidden"><FaUserCog /></span>
        </p>

        <ul className="flex flex-col gap-1 w-full mt-0">
          {emp_items.map((item, index) => (
            <li key={index} className="w-full">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 sm:px-5 py-2 rounded-md transition-all duration-300
                    ${isDark ? "hover:bg-white/20" : ""}
                    ${
                      isActive
                        ? "bg-white/10 text-blue-600 font-semibold"
                        : "hover:bg-black/20"
                    }`
                }
              >
                <span className="text-lg flex-shrink-0 w-6 h-6 flex items-center justify-center">{item.icon}</span>
                <span className="text-sm hidden sm:inline">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Manager/profile section */}
      <div className="w-full">
        <p className={`border-b-2 ml-0 sm:ml-1 mt-3 py-2 px-2 ${isDark ? "bg-blue-900/50 text-app" : "bg-gray-100 text-app"}`}>
          <span className="hidden sm:inline">Manage Profile</span>
          <span className="inline sm:hidden"><GrUserManager /></span>
        </p>

        <ul className="flex flex-col gap-1 w-full mt-2">
          {manager_items.map((item, index) => (
            <li key={index} className="w-full">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 sm:px-5 py-2 rounded-md transition-all duration-300
                    ${isDark ? "hover:bg-white/20" : ""}
                    ${
                      isActive
                        ? "bg-white/10 text-blue-600 font-semibold"
                        : "hover:bg-black/20"
                    }`
                }
              >
                <span className="text-lg flex-shrink-0 w-6 h-6 flex items-center justify-center">{item.icon}</span>
                <span className="text-sm hidden sm:inline">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer / Version */}
      <div className="text-left text-xs py-4 border-t border-white/20 w-full">
        <span className="hidden sm:inline">© 2025 HRly</span>
        <span className="inline sm:hidden text-xs">©25</span>
      </div>
    </div>
  );
}

export default DashboardSidebar;
