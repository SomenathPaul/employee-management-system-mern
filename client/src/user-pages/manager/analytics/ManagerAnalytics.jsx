// client/src/user-pages/manager/attendance/ManagerAttendance.jsx
import React from "react";
import ManagerDashboardLayout from "../ManagerDashboardLayout";
import AnalyticsTab from "./AnalyticsTab";

function ManagerAnalytics() {
  return (
    <>
      <ManagerDashboardLayout content={<AnalyticsTab />} />
    </>
  );
}

export default ManagerAnalytics;
