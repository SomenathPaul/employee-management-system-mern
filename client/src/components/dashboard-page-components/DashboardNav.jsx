// client/src/components/dashboard-page-components/DashboardNav.jsx
import React, { useEffect, useState, useContext } from "react";
import { href, NavLink, useNavigate } from "react-router-dom";
import NetworkIcon from "../NetworkStatus";
import BatteryStatus from "../BatteryStatus";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { MdSearch, MdArrowDropDown } from "react-icons/md";
import { RiNotification3Fill } from "react-icons/ri";
import { SiTicktick } from "react-icons/si";
import { FiRefreshCcw } from "react-icons/fi";
import ThemeButton from "../ThemeButton";
import { ThemeContext } from "../../context/ThemeContext";

/**
 * DashboardNav
 * - Responsive behavior:
 *   - md+ : full layout (search input, datetime, icons, country)
 *   - <md : compact layout: only NetworkIcon, small arrows, Refresh, ThemeButton, profile pic
 *   - mobile search: tap search icon to open small overlay input
 *
 * - Search behavior:
 *   - controlled input
 *   - Enter or click triggers navigation to /search?query=...
 *
 * Keep design exactly as original — only visibility and small interactive behaviors changed.
 */

function DashboardNav({ role = "Employee", photo = "default.jpg", name = "User", designation = "", country = "IN" }) {
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();

  // date / time
  const [dateTime, setDateTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => window.location.reload();

  // search state & mobile search toggle
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleSearch = (q = searchQuery) => {
    const trimmed = (q || "").trim();
    if (!trimmed) return;
    // route to a search results page (adjust path if your app uses different route)
    navigate(`/search?query=${encodeURIComponent(trimmed)}`);
    setShowMobileSearch(false);
  };

  const onKeyDownSearch = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // small-screen text color helper
  const grayTextClass = isDark ? "text-gray-300" : "text-gray-700";

  return (
    <nav
      className={`flex justify-between items-center w-full fadeClass ${
        isDark ? "bg-app text-app border-white/20" : "bg-app text-app border-black/20"
      } shadow-md px-4 py-3 md:px-8 border-b-2`}
    >
      {/* LEFT: network, role + back/forward */}
      <div className="flex items-center gap-3">
        <NetworkIcon />

        {/* role text: visible on md and up */}
        <p className={`text-lg font-semibold hidden sm:block ${grayTextClass}`}>
          {role.toUpperCase()}
        </p>

        {/* nav arrows: keep them small on all sizes, but hide on smallest if you prefer */}
        <div className={`flex items-center gap-2 ${grayTextClass}`}>
          <IoIosArrowBack className="cursor-pointer hidden sm:block hover:text-black" onClick={() => navigate(-1)} />
          <IoIosArrowForward className="cursor-pointer hidden sm:block hover:text-black" onClick={() => navigate(1)} />
        </div>
      </div>

      {/* MIDDLE: desktop search + refresh + date/time.
          - hidden on small screens (md:hidden)
          - on small screens we show a compact bar via icon (see right section)
      */}
      <div className="hidden md:flex items-center gap-4">
        {/* Search (desktop) */}
        <div className="relative">
          <MdSearch size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={onKeyDownSearch}
            className="border border-gray-300 rounded-full pl-10 pr-4 py-2 text-sm outline-none focus:ring-1 focus:ring-gray-400"
            aria-label="Search"
          />
        </div>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          className={`flex items-center gap-2 px-3 py-2 cursor-pointer ${isDark ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"} rounded-md outline-1 outline-gray-300 active:scale-95 transition-all`}
          title="Refresh"
        >
          <FiRefreshCcw className="text-lg" />
          <span>Refresh</span>
        </button>

        {/* Date & time pill */}
        <div className={`text-center ${isDark ? "text-gray-300" : "text-gray-500"}`}>
          <p>
            {dateTime.toLocaleDateString()}{" "}
            <span className={`p-2 rounded ${isDark ? "bg-blue-900" : "bg-blue-100"}`}>
              {dateTime.toLocaleTimeString()}
            </span>
          </p>
        </div>
      </div>

      {/* RIGHT: icons, profile */}
      <div className="flex items-center gap-5">
        {/* Icon set - NOTE: many icons hidden on small screens to keep layout clean */}
        <div className="hidden sm:flex items-center gap-3 text-gray-600">
          <BatteryStatus className={`${isDark ? "bg-blue-900" : "bg-blue-100"}`} />
          <NavLink to={`/${role.toLowerCase()}/notifications`}>
            <RiNotification3Fill size={22} className={`cursor-pointer ${isDark ? "text-gray-300" : "text-gray-700"}`} />
          </NavLink>
          <ThemeButton />
          <p className={`px-2 py-1 rounded-md text-xs font-medium ${isDark ? "bg-blue-900 text-gray-300" : "bg-blue-100 text-gray-700"}`}>
            {country}
          </p>
        </div>

        {/* For smallest devices: compact controls (search icon, refresh, theme, profile)
            - search icon toggles a small overlay search input
            - these buttons are visible on small screens (sm:hidden)
        */}
        <div className="flex items-center gap-3 sm:hidden">
          {/* mobile search toggle */}
          <button
            onClick={() => setShowMobileSearch((s) => !s)}
            aria-label="Open search"
            className={`p-2 rounded ${isDark ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"}`}
            title="Search"
          >
            <MdSearch size={20} />
          </button>

          {/* keep refresh on small screens */}
          <button
            onClick={handleRefresh}
            aria-label="Refresh"
            className={`p-2 rounded ${isDark ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"}`}
            title="Refresh"
          >
            <FiRefreshCcw size={18} />
          </button>

          {/* theme toggle */}
          <div className="p-0">
            <ThemeButton />
          </div>
        </div>

        {/* User Info — profile picture always visible;
            name/designation only appear on >= sm
        */}
        <div className={`flex items-center gap-2 border-l border-gray-200 pl-4 ${isDark ? "border-gray-700" : ""}`}>
          <NavLink to={`/${role.toLowerCase()}/profile`} className="flex items-center gap-1 cursor-pointer">
            <img src={`http://localhost:5000/uploads/${photo}`} alt="User" className="w-9 h-9 rounded-full object-cover border-2" />
            <MdArrowDropDown className={`text-gray-600 hidden sm:block`} />
          </NavLink>

          {/* name + designation hidden on very small, show on sm+ */}
          <div className="hidden sm:block">
            <h3 className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>{name}</h3>
            <p className="text-xs text-gray-500">{designation}</p>
          </div>

          <SiTicktick size={20} className="text-green-500 hidden sm:block" />
        </div>
      </div>

      {/* Mobile search overlay — appears when showMobileSearch is true (small only) */}
      {showMobileSearch && (
        <div className={`fixed inset-0 z-50 flex items-start justify-center p-4 sm:hidden`}>
          {/* background dim */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileSearch(false)} />
          <div className={`relative w-full max-w-md mt-12`}>
            <div className={`flex items-center gap-2 p-2 rounded-full ${isDark ? "bg-slate-700" : "bg-white"} shadow`}>
              <MdSearch size={18} className="ml-2 text-gray-500" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={onKeyDownSearch}
                placeholder="Search..."
                className={`flex-1 outline-none bg-transparent px-2 ${isDark ? "text-gray-200" : "text-gray-800"}`}
              />
              <button
                onClick={() => handleSearch()}
                className={`px-3 py-1 rounded ${isDark ? "text-gray-200" : "text-gray-800"}`}
              >
                Search
              </button>
              <button onClick={() => setShowMobileSearch(false)} className="p-2 text-gray-500">
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default DashboardNav;
