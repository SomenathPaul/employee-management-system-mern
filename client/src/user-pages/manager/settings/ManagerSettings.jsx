// client/src/user-pages/manager/settings/ManagerSettings.jsx
import React from "react";
import ManagerDashboardLayout from "../ManagerDashboardLayout";
import SettingsTab from "../../../components/settings/SettingsTab";

function ManagerSettings() {
  return (
    <>
      <ManagerDashboardLayout content={<SettingsTab />} />
    </>
  );
}

export default ManagerSettings;
