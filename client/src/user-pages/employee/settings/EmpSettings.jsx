// client/src/user-pages/employee/settings/EmpSettings.jsx
import React from "react";
import EmpDashboardLayout from "../EmpDashboardLayout";
import SettingsTab from "../../../components/settings/SettingsTab";

function EmpSettings() {
  return (
    <>
      <EmpDashboardLayout content={<SettingsTab />} />
    </>
  );
}

export default EmpSettings;
