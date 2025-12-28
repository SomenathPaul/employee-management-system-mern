// client/src/user-pages/manager/profile/ProfileTab.jsx
import React, { useContext } from "react";
import { FaUserEdit, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaVenusMars } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import { ThemeContext } from "../../../context/ThemeContext";

/**
 * ProfileTab Component
 * Purpose: Displays a comprehensive overview of the Manager's profile information.
 * Features: Responsive grid layout, theme-aware styling, and quick-access edit actions.
 */
function ProfileTab() {
  const { user } = useContext(AuthContext);
  const { isDark } = useContext(ThemeContext);

  // Guard: Handle initial load state where user data might be fetching
  if (!user) {
    return (
      <div className={`h-full flex items-center justify-center p-6 ${isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"}`}>
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-medium opacity-60">Synchronizing Profile...</p>
        </div>
      </div>
    );
  }

  // Define route prefix based on role (e.g., /manager/settings)
  const navUser = (user.role || "user").toLowerCase();

  // --- Theme Orchestration ---
  const pageBg = isDark ? "bg-slate-900 text-slate-100" : "bg-gray-50 text-slate-900";
  const headerBg = isDark ? "bg-gradient-to-r from-slate-800 to-slate-900" : "bg-gradient-to-r from-indigo-600 to-blue-700";
  const cardBg = isDark ? "bg-slate-800/50 backdrop-blur-md border border-slate-700 shadow-xl" : "bg-white border border-gray-100 shadow-sm";
  const labelColor = isDark ? "text-slate-400" : "text-slate-500";
  const iconColor = isDark ? "text-indigo-400" : "text-indigo-600";

  // Safe date formatting
  const joiningDateText = user.joiningDate ? (() => {
    try {
      return new Date(user.joiningDate).toLocaleDateString(undefined, { dateStyle: 'long' });
    } catch {
      return user.joiningDate;
    }
  })() : "Not set";

  return (
    <div className={`h-full overflow-y-auto transition-colors duration-300 ${pageBg}`}>
      
      {/* --- HERO HEADER SECTION --- */}
      <div className={`relative px-6 py-10 md:px-12 md:py-16 ${headerBg} text-white`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            {/* Avatar Container with Theme-aware border */}
            <div className="relative group">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl bg-white/10">
                {user.photo ? (
                  <img
                    src={user.photo.startsWith("http") ? user.photo : `http://localhost:5000/uploads/${user.photo}`}
                    alt="Profile"
                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-40 italic text-xs">No Image</div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 border-2 border-white dark:border-slate-900 w-6 h-6 rounded-full" title="Active Account"></div>
            </div>

            {/* Basic Identity */}
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                {user.name}
              </h1>
              <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-3 items-center">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                  {user.role}
                </span>
                <span className="text-lg opacity-90 font-medium">{user.designation || "Executive"}</span>
              </div>
              <p className="mt-1 text-sm opacity-60 font-medium italic">{user.department || "Organization"}</p>
            </div>
          </div>

          {/* Edit Shortcut */}
          <NavLink to={`/${navUser}/settings`}>
            <button className="flex items-center gap-2 bg-white text-indigo-700 font-black px-6 py-3 rounded-2xl shadow-xl hover:bg-indigo-50 active:scale-95 transition-all">
              <FaUserEdit size={18} /> Edit Profile
            </button>
          </NavLink>
        </div>
      </div>

      {/* --- PROFILE CONTENT GRID --- */}
      <div className="max-w-7xl mx-auto p-6 md:p-12 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* CARD 1: Basic Information */}
          <section className={`rounded-3xl p-8 transition-all hover:shadow-2xl ${cardBg}`}>
            <div className="flex items-center gap-3 mb-8">
              <div className={`p-3 rounded-xl ${isDark ? "bg-blue-500/10" : "bg-blue-50"}`}>
                <FaEnvelope className={iconColor} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Identity Details</h3>
            </div>

            <ul className="space-y-6">
              <InfoItem icon={<FaEnvelope />} label="Email Address" value={user.email} isDark={isDark} />
              <InfoItem icon={<FaPhone />} label="Phone Number" value={user.phone} isDark={isDark} />
              <InfoItem icon={<FaVenusMars />} label="Gender Identity" value={user.gender} isDark={isDark} />
              <InfoItem icon={<FaCalendarAlt />} label="Member Since" value={joiningDateText} isDark={isDark} />
            </ul>
          </section>

          {/* CARD 2: Address Information */}
          <section className={`rounded-3xl p-8 transition-all hover:shadow-2xl ${cardBg}`}>
            <div className="flex items-center gap-3 mb-8">
              <div className={`p-3 rounded-xl ${isDark ? "bg-purple-500/10" : "bg-purple-50"}`}>
                <FaMapMarkerAlt className={isDark ? "text-purple-400" : "text-purple-600"} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Location Details</h3>
            </div>

            <div className="space-y-6">
              <div>
                <p className={`${labelColor} text-[10px] font-black uppercase tracking-widest mb-1.5`}>Primary Residence</p>
                <p className="text-lg leading-relaxed font-semibold">{user.address || "No address on file"}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-6 pt-4 border-t border-inherit">
                <InfoItem label="City" value={user.city} isDark={isDark} />
                <InfoItem label="State/Province" value={user.state} isDark={isDark} />
                <InfoItem label="Postal Code" value={user.pincode} isDark={isDark} />
                <InfoItem label="Country" value={user.country} isDark={isDark} />
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

/**
 * Reusable InfoItem sub-component for clean rendering of key-value pairs
 */
function InfoItem({ icon, label, value, isDark }) {
  const labelColor = isDark ? "text-slate-400" : "text-slate-500";
  return (
    <li className="flex flex-col">
      <span className={`${labelColor} text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-2`}>
        {icon && <span className="text-[10px]">{icon}</span>} {label}
      </span>
      <span className="text-base font-bold truncate" title={value}>{value || "—"}</span>
    </li>
  );
}

export default ProfileTab;