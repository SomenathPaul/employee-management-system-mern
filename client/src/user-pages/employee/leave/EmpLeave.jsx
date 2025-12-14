// client/src/user-pages/employee/leave/EmpLeave.jsx
import React from "react";
import EmpDashboardLayout from "../EmpDashboardLayout";
import LeaveTab from "./LeaveTab";

function EmpLeave() {
  return (
    <>
      <EmpDashboardLayout content={<LeaveTab />} />
    </>
  );
}

export default EmpLeave;
