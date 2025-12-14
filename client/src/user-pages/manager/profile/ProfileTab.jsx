// client/src/user-pages/manager/profile/ProfileTab.jsx
import React, { useContext } from "react";
import { FaUserEdit } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import { ThemeContext } from "../../../context/ThemeContext";

function ProfileTab() {
  const { user } = useContext(AuthContext);
  const { isDark } = useContext(ThemeContext);

  // Guard: if user not loaded yet
  if (!user) {
    return (
      <div className={`h-full rounded-lg shadow-md p-6 overflow-y-auto ${isDark ? "bg-slate-900 text-gray-200" : "bg-white text-gray-900"}`}>
        <div className={isDark ? "text-gray-400" : "text-gray-600"}>Loading profile…</div>
      </div>
    );
  }

  const navUser = (user.role || "user").toLowerCase();

  // Theme classes
  const pageBg = isDark ? "bg-slate-900 text-gray-200" : "bg-white text-gray-900";
  const panelBg = isDark ? "bg-slate-800/80 border-slate-700" : "bg-gray-50";
  const cardBg = isDark ? "bg-slate-800 border-slate-700 text-gray-200" : "bg-gray-50 text-gray-900";
  const headerText = isDark ? "text-gray-100" : "text-gray-800";
  const metaText = isDark ? "text-gray-300" : "text-gray-500";
  const btnPrimary = isDark ? "flex items-center mt-4 md:mt-0 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-500 transition-all" : "flex items-center mt-4 md:mt-0 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-all";
  const imgWrapperBg = isDark ? "bg-slate-700" : "bg-gray-100";
  const borderClass = isDark ? "border border-slate-700" : "border";

  const joiningDateText = user.joiningDate ? (() => {
    try {
      return new Date(user.joiningDate).toLocaleDateString();
    } catch {
      return user.joiningDate;
    }
  })() : "—";

  return (
    <div className={`h-full shadow-md p-6 overflow-y-auto ${pageBg}`}>
      {/* Header */}
      <div className={`flex flex-col md:flex-row items-center justify-between mb-6 border-b pb-4 ${isDark ? "border-slate-700" : "border-gray-200"}`}>
        <div className="flex items-center space-x-4">
          <div className={`w-24 h-24 rounded-full shadow-md ${imgWrapperBg} ${borderClass} overflow-hidden flex items-center justify-center`}>
            {user.photo ? (
              <img
                src={user.photo.startsWith("http") ? user.photo : `http://localhost:5000/uploads/${user.photo}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={isDark ? "text-gray-400" : "text-gray-400"}>No Photo</div>
            )}
          </div>

          <div>
            <h2 className={`text-2xl font-semibold ${headerText}`}>
              {user.name}
              <span className={`text-sm ${metaText}`}> ({user.role})</span>
            </h2>
            <p className={metaText}>{user.designation || "—"}</p>
            <p className="text-sm" style={{ color: isDark ? "#9CA3AF" : "#6B7280" }}>{user.department || "—"}</p>
          </div>
        </div>

        <NavLink to={`/${navUser}/settings`}>
          <button className={btnPrimary}>
            <FaUserEdit className="mr-2" /> Edit Profile
          </button>
        </NavLink>
      </div>

      {/* Profile Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className={`${cardBg} rounded-2xl p-5 shadow-sm ${borderClass}`}>
          <h3 className={`text-lg font-semibold ${headerText} mb-4`}>
            Basic Information
          </h3>
          <ul className="space-y-2" style={{ color: isDark ? "#E5E7EB" : "#374151" }}>
            <li>
              <strong className={headerText}>Email:</strong> <span className={metaText}> {user.email || "—"}</span>
            </li>
            <li>
              <strong className={headerText}>Phone:</strong> <span className={metaText}> {user.phone || "—"}</span>
            </li>
            <li>
              <strong className={headerText}>Gender:</strong> <span className={metaText}> {user.gender || "—"}</span>
            </li>
            <li>
              <strong className={headerText}>Date of Joining:</strong> <span className={metaText}> {joiningDateText}</span>
            </li>
          </ul>
        </div>

        {/* Address Info */}
        <div className={`${cardBg} rounded-2xl p-5 shadow-sm ${borderClass}`}>
          <h3 className={`text-lg font-semibold ${headerText} mb-4`}>
            Address Information
          </h3>
          <p className={metaText}>
            {user.address || "—"}<br />
            <strong className={headerText}>City:</strong> {user.city || "—"}<br />
            <strong className={headerText}>State:</strong> {user.state || "—"}<br />
            <strong className={headerText}>Pincode:</strong> {user.pincode || "—"}<br />
            <strong className={headerText}>Country:</strong> {user.country || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProfileTab;
