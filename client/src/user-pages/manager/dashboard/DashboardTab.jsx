// client/src/user-pages/manager/dashboard/DashboardTab.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import WelcomeBanner from "../../../components/dashboard-ui-components/WelcomeBanner";
import DashboardAttendanceWidget from "../../../components/dashboard-ui-components/manager/DashboardAttendanceWidget";
import DashboardTaskWidget from "../../../components/dashboard-ui-components/manager/DashboardTaskWidget";
import DashboardLeaveWidget from "../../../components/dashboard-ui-components/manager/DashboardLeaveWidget";
import NotificationsList from "../../../components/dashboard-ui-components/NotificationsList";
import QuickLinksManager from "../../../components/dashboard-ui-components/manager/QuickLinksManager";

import { AuthContext } from "../../../context/AuthContext";
import { ThemeContext } from "../../../context/ThemeContext";

const DashboardTab = () => {
  const { user } = useContext(AuthContext);
  const { isDark } = useContext(ThemeContext);

  // ---------------- UI ----------------
  return (
    <div
      className={`h-full shadow-md p-5 overflow-y-auto ${
        isDark ? "bg-app text-app" : "bg-app text-app"
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <WelcomeBanner name={user.name} />
        </div>

        {/* ✅ NOW DATA IS PASSED */}
        <DashboardAttendanceWidget />

        <DashboardLeaveWidget />
        <DashboardTaskWidget />
        <NotificationsList />
        <QuickLinksManager />
      </div>
    </div>
  );
};

export default DashboardTab;
