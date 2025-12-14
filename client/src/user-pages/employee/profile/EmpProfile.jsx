// client/src/user-pages/employee/profile/EmpProfile.jsx
import React from "react";
import EmpDashboardLayout from "../EmpDashboardLayout";
import ProfileTab from "./ProfileTab";

function EmpDashboard() {
  return (
    <>
      <EmpDashboardLayout content={<ProfileTab />} />
    </>
  );
}

export default EmpDashboard;
