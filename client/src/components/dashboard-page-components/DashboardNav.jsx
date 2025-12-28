// client/src/components/dashboard-page-components/DashboardNav.jsx
import React, { useEffect, useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import NetworkIcon from "../NetworkStatus";
import BatteryStatus from "../BatteryStatus";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { MdSearch, MdArrowDropDown } from "react-icons/md";
import { RiNotification3Fill } from "react-icons/ri";
import { SiTicktick } from "react-icons/si";
import { FiRefreshCcw } from "react-icons/fi";
import ThemeButton from "../ThemeButton";
import { ThemeContext } from "../../context/ThemeContext";
import { NotificationContext } from "../../context/NotificationContext";




/**
 * DashboardNav Component
 * Provides global search, navigation controls, system status (battery/network),
 * theme toggling, and user profile access.
 */
function DashboardNav({
  role = "Employee",
  photo = "default.jpg",
  name = "User",
  designation = "",
  country = "IN",
}) {
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { unreadCount } = useContext(NotificationContext);


// 🔍 Role-aware searchable features
// 🔍 Role-aware searchable features
const SEARCH_CONFIG = [
  // Common Features
  { label: "Dashboard", keywords: ["dashboard", "home"], route: (role) => `/${role.toLowerCase()}/dashboard`, roles: ["Employee", "Manager"] },
  { label: "Profile", keywords: ["profile", "account"], route: (role) => `/${role.toLowerCase()}/profile`, roles: ["Employee", "Manager"] },
  { label: "Settings", keywords: ["settings", "profile settings"], route: (role) => `/${role.toLowerCase()}/profile`, roles: ["Employee", "Manager"] },
  { label: "Logout", keywords: ["logout", "sign out"], route: (role) => `/${role.toLowerCase()}/logout`, roles: ["Employee", "Manager"] },
  { label: "Messages", keywords: ["messages", "message", "chats", "msg"], route: (role) => `/${role.toLowerCase()}/messages`, roles: ["Employee", "Manager"] },
  { label: "Notifications", keywords: ["notifications", "alerts", "updates"], route: (role) => `/${role.toLowerCase()}/notifications`, roles: ["Employee", "Manager"] },
  // Employee Features
  { label: "Attendance", keywords: ["attendance", "present", "absent", "progress"], route: () => "/employee/progress", roles: ["Employee"] },
  { label: "Progress", keywords: ["attendance", "present", "absent", "progress", "leave"], route: () => "/employee/progress", roles: ["Employee"] },
  { label: "Leaves", keywords: ["leave", "leaves", "apply leave", "leave history", "history leave", "request leave"], route: () => "/employee/leave-requests", roles: ["Employee"] },
  { label: "Tasks", keywords: ["task", "tasks", "pending"], route: () => "/employee/tasks", roles: ["Employee"] },
  // Manager Features
  { label: "Attendance Analytics", keywords: ["attendance", "analytics", "report"], route: () => "/manager/employee-analytics-status", roles: ["Manager"] },
  { label: "Analytics", keywords: ["analytics", "reports", "attendance", "leave", "tasks"], route: () => "/manager/employee-analytics-status", roles: ["Manager"] },
  { label: "Employee Profiles", keywords: ["profiles", "reports", "emp data", "employee data", "employee"], route: () => "/manager/employee-analytics-status", roles: ["Manager"] },
  { label: "Leave Requests", keywords: ["leave", "leave requests", "employee leave"], route: () => "/manager/leaves", roles: ["Manager"] },
  { label: "Assign Tasks", keywords: ["assign", "task assign", "check tasks"], route: () => "/manager/tasks", roles: ["Manager"] },
  
];

const [results, setResults] = useState([]);

// handleResultClick for selecting from dropdown
const handleResultClick = (item) => {
  const path = item.route(role);
  navigate(path);
  setSearchQuery("");
  setResults([]);
  setShowMobileSearch(false);
};

// handleSearch for when user presses 'Enter' or clicks 'Go'
const handleSearch = () => {
  const query = searchQuery.toLowerCase().trim();
  if (!query) return;

  // Find the first match based on keywords and role permissions
  const match = SEARCH_CONFIG.find(item => 
    item.roles.includes(role) && 
    item.keywords.some(k => query.includes(k) || k.includes(query))
  );

  if (match) {
    handleResultClick(match);
  } else {
    // Optional: Navigate to a generic search results page if no feature matches
    console.log("No specific feature matched");
  }
};



  // --- Real-time Date/Time Logic ---
  const [dateTime, setDateTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Search & Refresh Logic ---
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleRefresh = () => window.location.reload();

//   const handleSearch = (q = searchQuery) => {
//   const query = (q || "").toLowerCase().trim();
//   if (!query) return;

//   const match = SEARCH_ROUTES.find(item =>
//     item.keys.some(k => query.includes(k))
//   );

//   if (match) {
//     navigate(match.route);
//   } else {
//     alert("No matching feature found");
//   }

//   setSearchQuery("");
//   setShowMobileSearch(false);
// };


  const onKeyDownSearch = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // --- Theme Dynamic Classes ---
  const textClass = isDark ? "text-slate-200" : "text-slate-700";
  const mutedTextClass = isDark ? "text-slate-400" : "text-slate-500";
  const navBg = isDark ? "bg-slate-900" : "bg-white/90";
  const borderClass = isDark ? "border-slate-800" : "border-slate-200";

  return (
    <nav
      className={`sticky top-0 z-40 flex justify-between items-center w-full backdrop-blur-md transition-all duration-300 ${navBg} ${textClass} px-4 py-3 md:px-8 border-b border-b-gray-700 shadow-sm`}
    >
      {/* --- LEFT SECTION: System Status & History --- */}
      <div className="flex items-center gap-2 md:gap-4">
        <NetworkIcon />

        {/* Role Badge (Hidden on mobile) */}
        <div className="hidden sm:flex flex-col">
          <span
            className={`text-[10px] font-bold uppercase tracking-widest ${mutedTextClass}`}
          >
            Role
          </span>
          <p className="text-sm font-extrabold">{role}</p>
        </div>

        {/* Browser-like History Nav (Hidden on small mobile) */}
        <div className="hidden md:flex items-center gap-1 ml-2">
          <button
            onClick={() => navigate(-1)}
            className={`p-1.5 rounded-full hover:bg-black/5 transition-colors ${mutedTextClass}`}
            aria-label="Go back"
          >
            <IoIosArrowBack size={18} />
          </button>
          <button
            onClick={() => navigate(1)}
            className={`p-1.5 rounded-full hover:bg-black/5 transition-colors ${mutedTextClass}`}
            aria-label="Go forward"
          >
            <IoIosArrowForward size={18} />
          </button>
        </div>
      </div>

      {/* --- MIDDLE SECTION: Desktop Search & Clock --- */}
      {/* --- MIDDLE SECTION: Desktop Search & Clock --- */}
<div className="hidden lg:flex items-center gap-6">
  {/* Wrap in relative to anchor the results dropdown */}
  <div className="relative group">
    <div className="flex items-center">
      <MdSearch
        size={20}
        className="absolute left-3 text-slate-400 group-focus-within:text-blue-500 transition-colors"
      />
      <input
        type="text"
        placeholder="Search features..."
        value={searchQuery}
        onChange={(e) => {
          const value = e.target.value;
          setSearchQuery(value);
          if (!value.trim()) {
            setResults([]);
            return;
          }
          const filtered = SEARCH_CONFIG.filter((item) =>
            item.roles.includes(role) &&
            item.keywords.some((k) => value.toLowerCase().includes(k) || k.includes(value.toLowerCase()))
          );
          setResults(filtered);
        }}
        onKeyDown={onKeyDownSearch}
        className={`w-64 xl:w-80 pl-10 pr-4 py-2 text-sm rounded-xl border transition-all outline-none 
          ${isDark ? "bg-slate-800 border-slate-700 focus:border-blue-500" : "bg-slate-50 border-slate-200 focus:border-blue-400"}`}
      />
    </div>

    {/* Dropdown Results */}
    {results.length > 0 && (
      <div className={`absolute top-full left-0 mt-2 w-full rounded-xl shadow-2xl z-50 overflow-hidden
        ${isDark ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-200"}`}>
        {results.map((r, i) => (
          <div
            key={i}
            onClick={() => handleResultClick(r)}
            className={`px-4 py-3 cursor-pointer text-sm flex items-center gap-2 transition-colors
              ${isDark ? "hover:bg-slate-700 text-slate-200" : "hover:bg-blue-50 text-slate-700"}`}
          >
            <SiTicktick className="text-blue-500" size={12} />
            {r.label}
          </div>
        ))}
      </div>
    )}
  </div>
  
  {/* ... Refresh button and Clock ... */}
  {/* Global Refresh Action */}
        <button
          onClick={handleRefresh}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all active:scale-95 border ${borderClass} hover:bg-blue-500/5`}
        >
          <FiRefreshCcw className="animate-hover-spin" />
          <span>Refresh</span>
        </button>
 {/* Animated Clock Pill */}
        <div
          className={`flex items-center gap-3 px-4 py-2 rounded-2xl text-xs font-mono border ${borderClass} ${
            isDark ? "bg-slate-800/50" : "bg-slate-50"
          }`}
        >
          <span className={mutedTextClass}>
            {dateTime.toLocaleDateString()}
          </span>
          <span className="w-px h-3 bg-slate-300" />
          <span className="font-bold text-blue-500">
            {dateTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>
</div>

      {/* --- RIGHT SECTION: Utility Icons & Profile --- */}
      <div className="flex items-center gap-2 md:gap-5">
        {/* Desktop Utility Icons */}
        <div className="hidden sm:flex items-center gap-2 md:gap-4">
          <BatteryStatus />

          {/* Notifications with Pulse Badge */}
          <NavLink
            to={`/${role.toLowerCase()}/notifications`}
            className="relative p-2 rounded-full hover:bg-black/5 transition-colors"
          >
            <RiNotification3Fill size={22} className={textClass} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 text-white text-[9px] items-center justify-center font-bold">
                  {unreadCount}
                </span>
              </span>
            )}
          </NavLink>

          <ThemeButton />

          <span
            className={`px-2 py-1 rounded text-[10px] font-bold border ${
              isDark
                ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                : "bg-blue-50 border-blue-200 text-blue-600"
            }`}
          >
            {country}
          </span>
        </div>

        {/* Mobile-Only Controls */}
        <div className="flex items-center gap-1 sm:hidden">
          <button
            onClick={() => setShowMobileSearch(true)}
            className="p-2 rounded-full hover:bg-black/5"
          >
            <MdSearch size={24} />
          </button>
          <ThemeButton />
        </div>

        {/* User Profile Trigger */}
        <div className={`flex items-center gap-3 pl-4 border-l ${borderClass}`}>
          <div className="hidden md:flex flex-col items-end">
            <h3 className="text-sm font-bold leading-none">{name}</h3>
            <span className="text-[10px] text-slate-500 mt-1">
              {designation}
            </span>
          </div>

          <NavLink
            to={`/${role.toLowerCase()}/profile`}
            className="relative group"
          >
            <img
              src={`http://localhost:5000/uploads/${photo}`}
              alt="Profile"
              className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover border-2 border-blue-500/20 group-hover:border-blue-500 transition-all"
            />
            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-0.5">
              <SiTicktick className="text-green-500" size={12} />
            </div>
          </NavLink>
          {/* <MdArrowDropDown className={`hidden md:block ${mutedTextClass}`} /> */}
        </div>
      </div>

      {/* --- MOBILE SEARCH OVERLAY --- */}
      {showMobileSearch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm sm:hidden flex flex-col p-4 animate-in fade-in duration-200">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowMobileSearch(false)}
              className="p-2 bg-white/10 rounded-full text-white"
            >
              <FiX size={24} />
            </button>
          </div>
          <div
            className={`w-full flex items-center gap-2 p-3 rounded-2xl shadow-xl ${
              isDark ? "bg-slate-800" : "bg-white"
            }`}
          >
            <MdSearch size={24} className="text-slate-400" />
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={onKeyDownSearch}
              placeholder="Search..."
              className={`flex-1 bg-transparent outline-none font-medium ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            />
            <button
              onClick={() => handleSearch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold"
            >
              Go
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

// Simple internal component for the Close icon if not imported
const FiX = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default DashboardNav;
