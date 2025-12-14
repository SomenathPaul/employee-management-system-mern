// client/src/user-pages/manager/ManagerDashboardLayout.jsx
import React, { useContext } from "react";
import DashboardNav from "../../components/dashboard-page-components/DashboardNav";
import {DashboardSidebarManager} from "../../components/dashboard-page-components/DashboardSidebar";
import { AuthContext } from "../../context/AuthContext";

function ManagerDashboardLayout({ content }) {
  const { user } = useContext(AuthContext);
  return (
    <div className="w-screen h-screen flex flex-col bg-blue-500">
      <DashboardNav
        role={user?.role || "Manager"}
        photo={user?.photo || ""}
        name={user?.name || "User"}
        designation={user?.designation || "Manager"}
        country={user?.country || "Unknown"}
      />
      <div className="flex-grow flex justify-center items-center">
        <div className="w-1/6 h-full bg-amber-300">
          <DashboardSidebarManager user={user.role} />
        </div>
        <div className="w-5/6 h-[664px] bg-gray-100">{content}</div>
      </div>
    </div>
  );
}

export default ManagerDashboardLayout;
