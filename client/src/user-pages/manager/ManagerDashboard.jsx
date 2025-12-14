// client/src/user-pages/manager/ManagerDashboard.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import EmpDataTab from "./employee_profiles/EmpDataTab";
import EmployeeDetailPage from "./employee_profiles/EmployeeDetailPage";

export default function ManagerDashboard() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manager Dashboard</h1>
      </div>

      <Routes>
        <Route path="/" element={<div>Select an option or click Employee Details</div>} />
        <Route path="employee-profiles" element={<EmpDataTab />} />
        <Route path="employee-profiles/:id" element={<EmployeeDetailPage />} />
      </Routes>
    </div>
  );
}
