// client/src/user-pages/employee/EmpDashboardLayout.jsx
import React, { useContext } from "react";
import DashboardNav from "../../components/dashboard-page-components/DashboardNav";
import DashboardSidebar from "../../components/dashboard-page-components/DashboardSidebar";
import { AuthContext } from "../../context/AuthContext";

function EmpDashboardLayout({ content }) {
  const { user } = useContext(AuthContext);
  return (
    <div className="w-screen h-screen flex flex-col bg-blue-500">
      <DashboardNav
        role={user?.role || "Employee"}
        photo={user?.photo || ""}
        name={user?.name || "User"}
        designation={user?.designation || "Employee"}
        country={user?.country || "Unknown"}
      />
      <div className="flex-grow flex justify-center items-center">
        <div className="w-1/6 h-full bg-amber-300">
          <DashboardSidebar user={user.role} />
        </div>
        <div className="w-5/6 h-[664px] bg-gray-100">{content}</div>
      </div>
    </div>
  );
}

export default EmpDashboardLayout;
