// client/src/user-pages/employee/dashboard/EmpDashboard.jsx
import React from "react";
import EmpDashboardLayout from "../EmpDashboardLayout";
import DashboardTab from "./DashboardTab";

/**
 * EmpDashboard Component
 * * This component serves as the main entry point (page-level component) for the 
 * Employee Dashboard. It follows a "Layout-Content" pattern to maintain 
 * UI consistency across different dashboard pages.
 */
function EmpDashboard() {
  return (
    <>
      {/* EmpDashboardLayout: The persistent shell of the dashboard 
        containing the Sidebar and Navigation bar.
        
        DashboardTab: The actual data-driven content (stats, charts, 
        recent activity) passed as a prop to be rendered in the main view area.
      */}
      <EmpDashboardLayout content={<DashboardTab />} />
    </>
  );
}

export default EmpDashboard;