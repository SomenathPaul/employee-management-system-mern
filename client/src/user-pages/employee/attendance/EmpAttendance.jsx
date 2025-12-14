// client/src/user-pages/employee/attendance/EmpAttendance.jsx
import React from "react";
import EmpDashboardLayout from "../EmpDashboardLayout";
import AttendanceTab from "./AttendanceTab";

function EmpAttendance() {
  return (
    <>
      <EmpDashboardLayout content={<AttendanceTab />} />
    </>
  );
}

export default EmpAttendance;
