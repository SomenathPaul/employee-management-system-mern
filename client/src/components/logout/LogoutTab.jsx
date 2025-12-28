// client/src/components/logout/LogoutTab.jsx
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";

import api from "../../utils/api";

/**
 * LogoutTab Component
 * Provides a dedicated confirmation screen for users to securely end their session.
 * Features theme-aware styling and responsive button layouts.
 */
function LogoutTab() {
  const navigate = useNavigate();
  
  // --- Context Consumption ---
  const { isDark } = useContext(ThemeContext);
  const { logout } = useContext(AuthContext);

  // --- Theme-Based Design Classes ---
  // Main background of the whole tab area
  const containerBg = isDark ? "bg-slate-900 text-slate-200" : "bg-gray-50 text-slate-800";
  
  // The logout confirmation card
  const cardBg = isDark ? "bg-slate-800 border-slate-700 shadow-2xl" : "bg-white border-gray-100 shadow-xl";
  
  // "Go Back" button styling
  const secondaryBtn = isDark
    ? "bg-slate-700 text-slate-200 hover:bg-slate-600 border border-slate-600"
    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200";
    
  // "Logout" button styling
  const dangerBtn = isDark
    ? "bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-900/20"
    : "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30";
    
  const headingText = isDark ? "text-white" : "text-slate-900";
  const hintText = isDark ? "text-slate-400" : "text-slate-500";

  /**
   * Finalizes the logout process by clearing local state, 
   * navigating to login, and showing a confirmation alert.
   */
  const handleLogout = async () => {
    // 1. Clear session tokens and auth context state

    try {
      // 1️⃣ Mark attendance
      await api.post("/auth/logout");

    } catch (err) {
      console.error("Attendance logout failed", err);
    } finally {
      // 2️⃣ Clear auth no matter what
      logout();
      localStorage.clear();
      navigate("/login", { replace: true });
    }

    // 2. Redirect to login page and prevent user from clicking "Back" to return to the dashboard
    

    // 3. User feedback
    Swal.fire({
      title: "Logged Out!",
      text: "You have been logged out successfully.",
      icon: "success",
      confirmButtonColor: "#3b82f6",
      background: isDark ? "#1e293b" : "#fff",
      color: isDark ? "#fff" : "#000",
    });
  };

  return (
    <div className={`h-full w-full p-4 flex sm:items-center justify-center transition-colors duration-300 ${containerBg}`}>
      {/* Confirmation Card: 
          Responsive width (90% on mobile, max-md on tablets/desktop) 
      */}
      <div className={`w-full max-w-[90%] sm:max-w-md sm:p-8 p-4 rounded-3xl border transition-all duration-300 ${cardBg}`}>
        <div className="flex flex-col items-center">
          
          {/* Visual Asset */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-red-500/10 blur-3xl rounded-full" />
            <img 
              src="/user.gif" 
              alt="Logout Illustration" 
              className="w-32 sm:w-40 relative z-10 drop-shadow-md" 
            />
          </div>

          {/* Text Content */}
          <h2 className={`sm:text-2xl text-sm font-bold mb-2 ${headingText}`}>
            Logging Out?
          </h2>
          <p className={`text-center mb-8 text-[12px] sm:text-base leading-relaxed ${hintText}`}>
            Are you sure you want to end your session? We'll miss seeing you around!
          </p>

          {/* Responsive Button Group: 
              Horizontal on tablets/desktop, vertical stack on small mobile screens 
          */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 w-full sm:w-auto">
            <button 
              onClick={() => navigate(-1)} 
              className={`${secondaryBtn} px-8 py-3 text-[12px] sm:text-base rounded-xl font-medium transition-all active:scale-95 w-full sm:w-auto cursor-pointer`}
            >
              No, Stay
            </button>

            <button 
              onClick={handleLogout} 
              className={`${dangerBtn} px-8 py-3 text-[12px] sm:text-base rounded-xl font-bold transition-all active:scale-95 w-full sm:w-auto cursor-pointer`}
            >
              Yes, Logout
            </button>
          </div>

          <p className="mt-8 text-[10px] uppercase tracking-widest opacity-30 font-semibold">
            HRly Security System
          </p>
        </div>
      </div>
    </div>
  );
}

export default LogoutTab;