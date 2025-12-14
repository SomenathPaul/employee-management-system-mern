// client/src/user-pages/employee/dashboard/DashboardTab.jsx
import React, { useContext } from "react";
import WelcomeBanner from "../../../components/dashboard-ui-components/WelcomeBanner";
import AttendanceSummary from "../../../components/dashboard-ui-components/AttendanceSummary";
import TaskProgressChart from "../../../components/dashboard-ui-components/TaskProgressChart";
import NotificationsList from "../../../components/dashboard-ui-components/NotificationsList";
import DeadlinesCard from "../../../components/dashboard-ui-components/DeadlinesCard";
import QuickLinks from "../../../components/dashboard-ui-components/QuickLinks";

import { AuthContext } from "../../../context/AuthContext";
import { ThemeContext } from "../../../context/ThemeContext";

const DashboardTab = () => {
  const { user } = useContext(AuthContext);
  const { isDark } = useContext(ThemeContext);

  return (
    <div
      className={`h-full p-6 overflow-y-auto ${
        isDark ? "bg-slate-900 text-slate-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <WelcomeBanner name={user?.name} role={user?.role} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AttendanceSummary />
            <TaskProgressChart />
            <QuickLinks />
          </div>

          <div className="space-y-6">
            <NotificationsList />
            <DeadlinesCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
