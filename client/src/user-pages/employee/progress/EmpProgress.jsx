// client/src/user-pages/employee/attendance/EmpAttendance.jsx
import React from "react";
import EmpDashboardLayout from "../EmpDashboardLayout";
import ProgressTab from "./ProgressTab";

function EmpProgress() {
  return (
    <>
      <EmpDashboardLayout content={<ProgressTab />} />
    </>
  );
}

export default EmpProgress;
