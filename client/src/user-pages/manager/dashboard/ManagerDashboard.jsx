// client/src/user-pages/manager/dashboard/ManagerDashboard.jsxF
import React from "react";
import ManagerDashboardLayout from "../ManagerDashboardLayout";
import DashboardTab from "./DashboardTab";

function ManagerDashboard() {
  return (
    <>
      <ManagerDashboardLayout content={<DashboardTab />} />
    </>
  );
}

export default ManagerDashboard;
