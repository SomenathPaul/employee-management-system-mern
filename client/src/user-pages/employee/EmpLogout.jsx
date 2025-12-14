// client/src/user-pages/employee/EmpLogout.jsx
import React from "react";
import EmpDashboardLayout from "./EmpDashboardLayout";
import LogoutTab from "../../components/logout/LogoutTab";

function EmpLogout() {
  return (
    <>
      <EmpDashboardLayout content={<LogoutTab />} />
    </>
  );
}

export default EmpLogout;
