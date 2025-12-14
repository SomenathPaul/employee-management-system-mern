// client/src/user-pages/manager/employee_profiles/EmpData.jsx
import React from "react";
import ManagerDashboardLayout from "../ManagerDashboardLayout";
import EmpDataTab from "./EmpDataTab";

function EmpData() {
  return (
    <>
      <ManagerDashboardLayout content={<EmpDataTab />} />
    </>
  );
}

export default EmpData;
