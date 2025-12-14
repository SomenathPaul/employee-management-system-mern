// client/src/user-pages/manager/attendance/ManagerAttendance.jsx
import React from "react";
import ManagerDashboardLayout from "../ManagerDashboardLayout";
import AttendanceTab from "./AttendanceTab";

function ManagerAttendance() {
  return (
    <>
      <ManagerDashboardLayout content={<AttendanceTab />} />
    </>
  );
}

export default ManagerAttendance;
