// client/src/user-pages/manager/dashboard/DashboardTab.jsx
import React, { useContext } from "react";
import WelcomeBanner from "../../../components/dashboard-ui-components/manager/WelcomeBanner";
import DashboardAttendanceWidget from "../../../components/dashboard-ui-components/manager/DashboardAttendanceWidget";
import DashboardTaskWidget from "../../../components/dashboard-ui-components/manager/DashboardTaskWidget";
import DashboardLeaveWidget from "../../../components/dashboard-ui-components/manager/DashboardLeaveWidget";
import NotificationsList from "../../../components/dashboard-ui-components/NotificationsList";
import QuickLinksManager from "../../../components/dashboard-ui-components/manager/QuickLinksManager";

import { AuthContext } from "../../../context/AuthContext";
import { ThemeContext } from "../../../context/ThemeContext";

/**
 * Manager DashboardTab Component
 * * This is the central hub for the Managerial role. It provides a high-level 
 * overview of team operations, including task distributions and pending approvals.
 * * Layout Strategy:
 * - Uses a 3-column responsive grid (Tailwind CSS).
 * - Adapts from 1 column (Mobile) to 2 columns (Tablet) to 3 columns (Desktop).
 */
const DashboardTab = () => {
  // Fetch current authenticated user info (name, id, etc.)
  const { user } = useContext(AuthContext);
  
  // Fetch global theme preference to apply consistent styling
  const { isDark } = useContext(ThemeContext);

  // ---------------- UI RENDERING ----------------
  return (
    <div
      className={`h-full shadow-md p-5 overflow-y-auto transition-colors duration-300 ${
        isDark ? "bg-slate-900 text-slate-100" : "bg-gray-50 text-slate-900"
      }`}
    >
      {/* Main Grid Container 
          lg:grid-cols-3 -> 3 columns on large screens
          md:grid-cols-2 -> 2 columns on tablets
          grid-cols-1    -> 1 column on mobile
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* --- FULL WIDTH HERO SECTION ---
            WelcomeBanner spans across all available columns (3/3 on desktop) 
        */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <WelcomeBanner name={user.name} />
        </div>

        <DashboardAttendanceWidget />

        {/* --- TEAM LEAVE MANAGEMENT WIDGET ---
            Shows pending leave requests that need manager approval 
        */}
        <DashboardLeaveWidget />

        {/* --- TEAM TASK OVERVIEW WIDGET ---
            Displays task completion statuses across the managed team 
        */}
        <DashboardTaskWidget />

        {/* --- SHARED NOTIFICATIONS LIST ---
            Displays company-wide announcements (Shared component with Employee view) 
        */}
        <NotificationsList />

        {/* --- MANAGER QUICK ACTIONS ---
            Shortcuts for role-specific tasks like 'Add Employee' or 'Review Analytics' 
        */}
        <QuickLinksManager />
        
      </div>
    </div>
  );
};

export default DashboardTab;