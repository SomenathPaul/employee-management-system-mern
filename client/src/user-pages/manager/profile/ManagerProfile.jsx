// client/src/user-pages/manager/profile/ManagerProfile.jsx
import React from "react";
import ManagerDashboardLayout from "../ManagerDashboardLayout";
import ProfileTab from "./ProfileTab";

function ManagerDashboard() {
  return (
    <>
      <ManagerDashboardLayout content={<ProfileTab />} />
    </>
  );
}

export default ManagerDashboard;
