// client/src/user-pages/manager/notifications/ManagerNotifications.jsx
import React from "react";
import ManagerNotificationsTab from "./ManagerNotificationsTab";
import ManagerDashboardLayout from "../ManagerDashboardLayout";

function ManagerNotifications() {
  return (
    <>
      <ManagerDashboardLayout content={<ManagerNotificationsTab />} />
    </>
  );
}

export default ManagerNotifications;
