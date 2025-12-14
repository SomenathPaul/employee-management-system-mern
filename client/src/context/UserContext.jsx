// client/src/context/UserContext.jsx
import React, { createContext, useCallback, useEffect, useState } from "react";
import axios from "axios";

export const UserContext = createContext({
  users: [],
  loading: false,
  error: null,
  refreshUsers: () => Promise.resolve(),
  getEmployees: () => [],
});

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch users from backend
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        (process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api/user-data",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Expect res.data to be an array of users or { users: [...] }
      const payload = Array.isArray(res.data) ? res.data : res.data.users || [];
      setUsers(payload);
    } catch (err) {
      console.error("User fetch error:", err);
      setError(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Helper: return only employees (role === 'Employee', case-insensitive)
  const getEmployees = useCallback(
    (extraFilter = null) =>
      users.filter((u) => {
        const role = (u.role || "").toString().toLowerCase().trim();
        const isEmployee = role === "employee";
        if (!isEmployee) return false;
        if (!extraFilter) return true;
        // extraFilter can be a function or a string to match name/email
        if (typeof extraFilter === "function") return extraFilter(u);
        if (typeof extraFilter === "string") {
          const q = extraFilter.toLowerCase();
          return (
            (u.name || "").toLowerCase().includes(q) ||
            (u.email || "").toLowerCase().includes(q) ||
            (u.employeeId || "").toLowerCase().includes(q)
          );
        }
        return true;
      }),
    [users]
  );

  return (
    <UserContext.Provider
      value={{
        users,
        loading,
        error,
        refreshUsers: fetchUsers,
        getEmployees,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
