// client/src/user-pages/employee/notifications/EmpNotifications.jsx
import React from "react";
import NotificationsTab from "../../../components/notifications/NotificationsTab";
import EmpDashboardLayout from "../EmpDashboardLayout";

function EmpNotifications() {
  return (
    <>
      <EmpDashboardLayout content={<NotificationsTab />} />
    </>
  );
}

export default EmpNotifications;
