// client/src/user-pages/employee/dashboard/EmpDashboard.jsx
import React from "react";
import EmpDashboardLayout from "../EmpDashboardLayout";
import DashboardTab from "./DashboardTab";

function EmpDashboard() {
  return (
    <>
      <EmpDashboardLayout content={<DashboardTab />} />
    </>
  );
}

export default EmpDashboard;
