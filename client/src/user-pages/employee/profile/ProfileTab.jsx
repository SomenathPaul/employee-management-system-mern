// client/src/user-pages/employee/profile/ProfileTab.jsx
import React, { useContext } from "react";
import { FaUserEdit, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaVenusMars } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import { ThemeContext } from "../../../context/ThemeContext";
import AttendanceDashboard from "../../../components/emp-attendance/AttendanceDashboard";

/**
 * ProfileTab Component
 * Renders the comprehensive user profile including header, attendance dashboard,
 * and detailed personal information cards.
 */
function ProfileTab() {
  const { isDark } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);

  // Normalize role for dynamic routing (e.g., /employee/settings or /manager/settings)
  let navUser = user.role.toLowerCase();

  // --- Theme Dynamic Styling ---
  const containerBg = isDark ? "bg-slate-900 text-slate-100" : "bg-gray-50 text-slate-900";
  const headerBg = isDark ? "bg-gradient-to-r from-blue-900/40 via-slate-800 to-slate-900" : "bg-gradient-to-r from-blue-600 to-indigo-700";
  const cardBg = isDark ? "bg-slate-800/50 backdrop-blur-md border border-slate-700" : "bg-white shadow-sm border border-gray-100";
  const iconColor = isDark ? "text-blue-400" : "text-indigo-600";
  const labelColor = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <div className={`h-full overflow-y-auto transition-colors duration-300 ${containerBg}`}>
      
      {/* --- HERO HEADER SECTION --- */}
      <div className={`relative px-6 py-10 md:px-12 md:py-16 ${headerBg} text-white`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            {/* Profile Avatar */}
            <div className="relative">
              <img
                src={`http://localhost:5000/uploads/${user.photo}`}
                alt="Profile"
                className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover shadow-2xl border-4 border-white/20"
              />
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-2 border-white rounded-full" title="Active Account"></div>
            </div>

            {/* Identity Info */}
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                {user.name}
              </h1>
              <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-3 items-center opacity-90">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest">
                  {user.role}
                </span>
                <span className="text-lg font-medium">{user.designation}</span>
              </div>
              <p className="mt-1 text-sm opacity-75 font-medium italic">{user.department} Department</p>
            </div>
          </div>

          {/* Action Button */}
          <NavLink to={`/${navUser}/settings`}>
            <button className="flex items-center gap-2 bg-white text-indigo-700 font-bold px-6 py-3 rounded-2xl shadow-xl hover:bg-opacity-90 active:scale-95 transition-all">
              <FaUserEdit size={18} /> Edit Profile
            </button>
          </NavLink>
        </div>
      </div>

      {/* --- DASHBOARD & INFO CONTENT --- */}
      <div className="max-w-7xl mx-auto p-6 md:p-8 -mt-8 relative z-10">
        
        {/* Attendance Widget - Full Width */}
        <div className="mb-8">
          <AttendanceDashboard />
        </div>

        {/* Info Grid - Responsive 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* CARD 1: Basic Information */}
          <div className={`rounded-3xl p-8 transition-all hover:shadow-lg ${cardBg}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-xl ${isDark ? "bg-blue-500/10" : "bg-blue-50"}`}>
                <FaEnvelope className={iconColor} />
              </div>
              <h3 className="text-xl font-bold">Basic Information</h3>
            </div>

            <ul className="space-y-5">
              <InfoItem icon={<FaEnvelope />} label="Email Address" value={user.email} isDark={isDark} />
              <InfoItem icon={<FaPhone />} label="Phone Number" value={user.phone} isDark={isDark} />
              <InfoItem icon={<FaVenusMars />} label="Gender" value={user.gender} isDark={isDark} />
              <InfoItem icon={<FaCalendarAlt />} label="Joining Date" value={new Date(user.joiningDate).toLocaleDateString(undefined, { dateStyle: 'long' })} isDark={isDark} />
            </ul>
          </div>

          {/* CARD 2: Address Information */}
          <div className={`rounded-3xl p-8 transition-all hover:shadow-lg ${cardBg}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-xl ${isDark ? "bg-purple-500/10" : "bg-purple-50"}`}>
                <FaMapMarkerAlt className={isDark ? "text-purple-400" : "text-purple-600"} />
              </div>
              <h3 className="text-xl font-bold">Location Details</h3>
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <p className={`${labelColor} text-xs font-bold uppercase tracking-wider mb-1`}>Residential Address</p>
                <p className="text-lg leading-relaxed">{user.address}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="City" value={user.city} isDark={isDark} />
                <InfoItem label="State" value={user.state} isDark={isDark} />
                <InfoItem label="Pincode" value={user.pincode} isDark={isDark} />
                <InfoItem label="Country" value={user.country} isDark={isDark} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/**
 * Sub-component for rendering a stylized key-value pair
 */
function InfoItem({ icon, label, value, isDark }) {
  const labelColor = isDark ? "text-slate-400" : "text-slate-500";
  return (
    <li className="flex flex-col">
      <span className={`${labelColor} text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2`}>
        {icon && <span className="text-[10px]">{icon}</span>} {label}
      </span>
      <span className="text-base font-semibold truncate" title={value}>{value || "Not provided"}</span>
    </li>
  );
}

export default ProfileTab;