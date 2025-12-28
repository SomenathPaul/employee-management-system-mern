// client/src/routes/ProtectedRoute.jsx

import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/**
 * ProtectedRoute
 * ----------------
 * A wrapper component used to protect routes based on:
 * 1. Authentication status (logged in or not)
 * 2. Authorization (user role-based access)
 *
 * @param {ReactNode} children - Component to render if access is allowed
 * @param {Array<string>} allowedRoles - List of roles permitted to access the route
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  // Get authentication state from global context
  const { user, loading } = useContext(AuthContext);

  /**
   * While authentication status is being verified
   * (e.g., token validation, API call),
   * do not render anything to prevent flickering or wrong redirects.
   */
  if (loading) return null;

  /**
   * If user is not logged in,
   * redirect them to the login page.
   */
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  /**
   * If the route is role-protected and the user's role
   * is not included in allowedRoles,
   * redirect them to the Unauthorized page.
   */
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  /**
   * If all checks pass,
   * render the requested protected component.
   */
  return children;
};

export default ProtectedRoute;
