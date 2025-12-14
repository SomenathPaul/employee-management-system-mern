// client/src/routes/AppRoutes.jsx
import React, { useContext } from "react";
import { Routes, Route, NavLink } from "react-router-dom";

import LandingPage from "../pages/landing-page/LandingPage";
import Register from "../pages/register/Register";
import Login from "../pages/login/Login";

// Import Role-based Routes
import EmpDashboard from "../user-pages/employee/dashboard/EmpDashboard";
import EmpProfile from "../user-pages/employee/profile/EmpProfile";
import EmpAttendance from "../user-pages/employee/attendance/EmpAttendance";
import EmpLeave from "../user-pages/employee/leave/EmpLeave";
import EmpTask from "../user-pages/employee/tasks/EmpTask";
import EmpMessages from "../user-pages/employee/messages/EmpMessages";
import EmpSettings from "../user-pages/employee/settings/EmpSettings";
import EmpNotifications from "../user-pages/employee/notifications/EmpNotifications";
import EmpLogout from "../user-pages/employee/EmpLogout";
// import ManagerRoutes from "./ManagerRoutes";
import ManagerDashboard from "../user-pages/manager/dashboard/ManagerDashboard";
import ManagerProfile from "../user-pages/manager/profile/ManagerProfile";
import ManagerAttendance from "../user-pages/manager/attendance/ManagerAttendance";
import ManagerLeave from "../user-pages/manager/leave-requests/ManagerLeaveStatus";
import ManagerTask from "../user-pages/manager/tasks/ManagerTask";
import EditTaskPage from "../user-pages/manager/tasks/EditTaskPage";
import ManagerMessages from "../user-pages/manager/messages/ManagerMessages";
import ManagerSettings from "../user-pages/manager/settings/ManagerSettings";
import ManagerNotifications from "../user-pages/manager/notifications/ManagerNotifications";
import ManagerLogout from "../user-pages/manager/ManagerLogout";

import ProtectedRoute from "./ProtectedRoute";
import Unauthorized from "../components/Unauthorized";

import EmpData from "../user-pages/manager/employee_profiles/EmpData";
import EmployeeDetailPage from "../user-pages/manager/employee_profiles/EmployeeDetailPage";

function AppRoutes() {
  return (
    <Routes>
      {/* 🌍 Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* 👷 Employee Routes */}
      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Employee"]}>
            <EmpDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/profile"
        element={
          <ProtectedRoute allowedRoles={["Employee"]}>
            <EmpProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/attendance"
        element={
          <ProtectedRoute allowedRoles={["Employee"]}>
            <EmpAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/leave-requests"
        element={
          <ProtectedRoute allowedRoles={["Employee"]}>
            <EmpLeave />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/tasks"
        element={
          <ProtectedRoute allowedRoles={["Employee"]}>
            <EmpTask />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/messages"
        element={
          <ProtectedRoute allowedRoles={["Employee"]}>
            <EmpMessages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/settings"
        element={
          <ProtectedRoute allowedRoles={["Employee"]}>
            <EmpSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/notifications"
        element={
          <ProtectedRoute allowedRoles={["Employee"]}>
            <EmpNotifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/logout"
        element={
          <ProtectedRoute allowedRoles={["Employee"]}>
            <EmpLogout />
          </ProtectedRoute>
        }
      />

      {/* 👨‍💼 Manager Routes */}
      {/* ✅ Employees Profile */}
      <Route
        path="/manager/employee-profiles"
        element={
          <ProtectedRoute allowedRoles={["Manager"]}>
            <EmpData />
          </ProtectedRoute>
        }
      />
      {/* Manager: Employee detail */}
      <Route
        path="/manager/employee-profiles/:id"
        element={
          <ProtectedRoute allowedRoles={["Manager"]}>
            <EmployeeDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Manager: Employee list */}
      <Route
        path="/manager/employee-profiles"
        element={
          <ProtectedRoute allowedRoles={["Manager"]}>
            <EmpData />
          </ProtectedRoute>
        }
      />

      {/* ✅ Dashboard */}
      <Route
        path="/manager/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Manager"]}>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />

      {/* ✅ Profile */}
      <Route
        path="/manager/profile"
        element={
          <ProtectedRoute allowedRoles={["Manager"]}>
            <ManagerProfile />
          </ProtectedRoute>
        }
      />

      {/* ✅ Attendance */}
      <Route
        path="/manager/employee-attendance-status"
        element={
          <ProtectedRoute allowedRoles={["Manager"]}>
            <ManagerAttendance />
          </ProtectedRoute>
        }
      />

      {/* ✅ Leave */}
      <Route
        path="/manager/employee-leave-requests"
        element={
          <ProtectedRoute allowedRoles={["Manager"]}>
            <ManagerLeave />
          </ProtectedRoute>
        }
      />

      {/* ✅ Tasks */}
      <Route
        path="/manager/tasks"
        element={
          <ProtectedRoute allowedRoles={["Manager"]}>
            <ManagerTask />
          </ProtectedRoute>
        }
      />

      <Route
  path="/manager/tasks/:id/edit"
  element={
    <ProtectedRoute allowedRoles={["Manager","HR","Admin"]}>
      <EditTaskPage />
    </ProtectedRoute>
  }
/>

      {/* ✅ Messages */}
      <Route
        path="/manager/messages"
        element={
          <ProtectedRoute allowedRoles={["Manager"]}>
            <ManagerMessages />
          </ProtectedRoute>
        }
      />

      {/* ✅ Notifications */}
      <Route
        path="/manager/notifications"
        element={
          <ProtectedRoute allowedRoles={["Manager"]}>
            <ManagerNotifications />
          </ProtectedRoute>
        }
      />

      {/* ✅ Settings */}
      <Route
        path="/manager/settings"
        element={
          <ProtectedRoute allowedRoles={["Manager"]}>
            <ManagerSettings />
          </ProtectedRoute>
        }
      />

      {/* ✅ Logout */}
      <Route
        path="/manager/logout"
        element={
          <ProtectedRoute allowedRoles={["Manager"]}>
            <ManagerLogout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
