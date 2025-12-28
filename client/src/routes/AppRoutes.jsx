// client/src/routes/AppRoutes.jsx

import React from "react";
import { Routes, Route } from "react-router-dom";

/* =======================
   🌍 PUBLIC PAGES
   Accessible without login
======================= */
import LandingPage from "../pages/landing-page/LandingPage";
import Register from "../pages/register/Register";
import Login from "../pages/login/Login";
import Unauthorized from "../components/Unauthorized";

/* =======================
   🔐 ROUTE PROTECTION
   Handles role-based access
======================= */
import ProtectedRoute from "./ProtectedRoute";

/* =======================
   👷 EMPLOYEE MODULE
======================= */
import EmpDashboard from "../user-pages/employee/dashboard/EmpDashboard";
import EmpProfile from "../user-pages/employee/profile/EmpProfile";
import EmpProgress from "../user-pages/employee/progress/EmpProgress";
import EmpLeave from "../user-pages/employee/leave/EmpLeave";
import EmpTask from "../user-pages/employee/tasks/EmpTask";
import EmpMessages from "../user-pages/employee/messages/EmpMessages";
import EmpSettings from "../user-pages/employee/settings/EmpSettings";
import EmpNotifications from "../user-pages/employee/notifications/EmpNotifications";
import EmpLogout from "../user-pages/employee/EmpLogout";

/* =======================
   👨‍💼 MANAGER MODULE
======================= */
import ManagerDashboard from "../user-pages/manager/dashboard/ManagerDashboard";
import ManagerProfile from "../user-pages/manager/profile/ManagerProfile";
import ManagerAnalytics from "../user-pages/manager/analytics/ManagerAnalytics";
import ManagerLeave from "../user-pages/manager/leave-requests/ManagerLeaveStatus";
import ManagerTask from "../user-pages/manager/tasks/ManagerTask";
import EditTaskPage from "../user-pages/manager/tasks/EditTaskPage";
import ManagerMessages from "../user-pages/manager/messages/ManagerMessages";
import ManagerSettings from "../user-pages/manager/settings/ManagerSettings";
import ManagerNotifications from "../user-pages/manager/notifications/ManagerNotifications";
import ManagerLogout from "../user-pages/manager/ManagerLogout";

/* =======================
   👥 EMPLOYEE DATA (Manager View)
======================= */
import EmpData from "../user-pages/manager/employee_profiles/EmpData";
import EmployeeDetailPage from "../user-pages/manager/employee_profiles/EmployeeDetailPage";

function AppRoutes() {
  return (
    <Routes>

      {/* ======================================================
         🌍 PUBLIC ROUTES (No authentication required)
      ====================================================== */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* ======================================================
         👷 EMPLOYEE ROUTES
         Accessible only if role === "Employee"
      ====================================================== */}

      {/* 📊 Dashboard */}
      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Employee"]}>
            <EmpDashboard />
          </ProtectedRoute>
        }
      />

      {/* 👤 Profile */}
      <Route
        path="/employee/profile"
        element={
          <ProtectedRoute allowedRoles={["Employee"]}>
            <EmpProfile />
          </ProtectedRoute>
        }
      />

      {/* 📈 Progress */}
      <Route
        path="/employee/progress"
        element={
          <ProtectedRoute allowedRoles={["Employee"]}>
            <EmpProgress />
          </ProtectedRoute>
        }
      />

      {/* 📝 Leave Requests */}
      <Route
        path="/employee/leave-requests"
        element={
          <ProtectedRoute allowedRoles={["Employee"]}>
            <EmpLeave />
          </ProtectedRoute>
        }
      />

      {/* 📌 Task Management */}
      <Route
        path="/employee/tasks"
        element={
          <ProtectedRoute allowedRoles={["Employee"]}>
            <EmpTask />
          </ProtectedRoute>
        }
      />

      {/* 💬 Messages */}
      <Route
        path="/employee/messages"
        element={
          <ProtectedRoute allowedRoles={["Employee"]}>
            <EmpMessages />
          </ProtectedRoute>
        }
      />

      {/* ⚙️ Settings */}
      <Route
        path="/employee/settings"
        element={
          <ProtectedRoute allowedRoles={["Employee"]}>
            <EmpSettings />
          </ProtectedRoute>
        }
      />

      {/* 🔔 Notifications */}
      <Route
        path="/employee/notifications"
        element={
          <ProtectedRoute allowedRoles={["Employee"]}>
            <EmpNotifications />
          </ProtectedRoute>
        }
      />

      {/* 🚪 Logout */}
      <Route
        path="/employee/logout"
        element={
          <ProtectedRoute allowedRoles={["Employee"]}>
            <EmpLogout />
          </ProtectedRoute>
        }
      />

      {/* ======================================================
         👨‍💼 MANAGER ROUTES
         Accessible only if role === "Manager"
      ====================================================== */}

      {/* 📋 Employee List */}
      <Route
        path="/manager/employee-profiles"
        element={
          <ProtectedRoute allowedRoles={["Manager"]}>
            <EmpData />
          </ProtectedRoute>
        }
      />

      {/* 🔍 Employee Details */}
      <Route
        path="/manager/employee-profiles/:id"
        element={
          <ProtectedRoute allowedRoles={["Manager"]}>
            <EmployeeDetailPage />
          </ProtectedRoute>
        }
      />

      {/* 📊 Dashboard */}
      <Route
        path="/manager/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Manager"]}>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />

      {/* 👤 Profile */}
      <Route
        path="/manager/profile"
        element={
          <ProtectedRoute allowedRoles={["Manager"]}>
            <ManagerProfile />
          </ProtectedRoute>
        }
      />

      {/* 📈 Analytics */}
      <Route
        path="/manager/employee-analytics-status"
        element={
          <ProtectedRoute allowedRoles={["Manager"]}>
            <ManagerAnalytics />
          </ProtectedRoute>
        }
      />

      {/* 📝 Leave Management */}
      <Route
        path="/manager/employee-leave-requests"
        element={
          <ProtectedRoute allowedRoles={["Manager"]}>
            <ManagerLeave />
          </ProtectedRoute>
        }
      />

      {/* 📌 Task Management */}
      <Route
        path="/manager/tasks"
        element={
          <ProtectedRoute allowedRoles={["Manager"]}>
            <ManagerTask />
          </ProtectedRoute>
        }
      />

      {/* ✏️ Edit Task (Extended Roles) */}
      <Route
        path="/manager/tasks/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["Manager", "HR", "Admin"]}>
            <EditTaskPage />
          </ProtectedRoute>
        }
      />

      {/* 💬 Messages */}
      <Route
        path="/manager/messages"
        element={
          <ProtectedRoute allowedRoles={["Manager"]}>
            <ManagerMessages />
          </ProtectedRoute>
        }
      />

      {/* 🔔 Notifications */}
      <Route
        path="/manager/notifications"
        element={
          <ProtectedRoute allowedRoles={["Manager"]}>
            <ManagerNotifications />
          </ProtectedRoute>
        }
      />

      {/* ⚙️ Settings */}
      <Route
        path="/manager/settings"
        element={
          <ProtectedRoute allowedRoles={["Manager"]}>
            <ManagerSettings />
          </ProtectedRoute>
        }
      />

      {/* 🚪 Logout */}
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
