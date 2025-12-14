// client/src/user-pages/manager/leave-requests/ManagerLeaveStatus.jsx
import React from "react";
import ManagerDashboardLayout from "../ManagerDashboardLayout";
import LeaveRequestsTab from "./LeaveRequestsTab";

function ManagerLeaveStatus() {
  return (
    <>
      <ManagerDashboardLayout content={<LeaveRequestsTab />} />
    </>
  );
}

export default ManagerLeaveStatus;