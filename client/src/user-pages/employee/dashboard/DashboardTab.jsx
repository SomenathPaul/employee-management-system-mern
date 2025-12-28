// client/src/user-pages/employee/dashboard/DashboardTab.jsx
import React, { useContext } from "react";
import WelcomeBanner from "../../../components/dashboard-ui-components/WelcomeBanner";
import TaskProgressChart from "../../../components/dashboard-ui-components/TaskProgressChart";
import NotificationsList from "../../../components/dashboard-ui-components/NotificationsList";
import DeadlinesCard from "../../../components/dashboard-ui-components/DeadlinesCard";
import QuickLinks from "../../../components/dashboard-ui-components/QuickLinks";

import { AuthContext } from "../../../context/AuthContext";
import { ThemeContext } from "../../../context/ThemeContext";

/**
 * DashboardTab Component
 * * This is the primary view for the Employee Dashboard. It aggregates various
 * specialized UI components into a responsive grid layout.
 * * Key Responsibilities:
 * 1. Theme Management: Switches between Slate (Dark) and Gray (Light) palettes.
 * 2. Layout Orchestration: Manages a 3-column grid that stacks on smaller screens.
 * 3. Context Integration: Pulls user data and theme preferences to pass to sub-components.
 */
const DashboardTab = () => {
  // Access global authentication state for personalized greeting
  const { user } = useContext(AuthContext);

  // Access global theme state for dynamic styling of the dashboard container
  const { isDark } = useContext(ThemeContext);

  return (
    <div
      className={`h-full p-6 overflow-y-auto transition-colors duration-300 ${
        isDark ? "bg-slate-900 text-slate-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* --- HEADER SECTION --- 
            Personalized greeting based on authenticated user data */}
        <WelcomeBanner name={user?.name} role={user?.role} />

        {/* --- MAIN DASHBOARD GRID --- 
            Layout: 1 Column on Mobile, 3 Columns on LG screens and up */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Main Analytics & Utilities (Occupies 2/3 of space on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            {/* AttendanceSummary placeholder: Future module for clock-in/out trends */}
            {/* <AttendanceSummary /> */}

            {/* Visual representation of task status (Pending, In Progress, Done) */}
            <TaskProgressChart />

            {/* Shortcuts to frequent actions (Apply Leave, View Payslip, etc.) */}
            <QuickLinks />
          </div>

          {/* RIGHT COLUMN: Real-time Info & Alerts (Occupies 1/3 of space on desktop) */}
          <div className="space-y-6">
            {/* Critical upcoming dates for assigned tasks or projects */}
            <DeadlinesCard />
            {/* Recent company-wide announcements and notifications */}
            <NotificationsList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
