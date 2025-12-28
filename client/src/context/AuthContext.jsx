// client/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();
import api from "../utils/api";

/**
 * Backward-compatible AuthProvider.
 * - Keeps the same public API: { user, token, login, logout }
 * - Adds `loading` internally to avoid flashes (not required to consume)
 * - Fetches fresh user profile when a token exists
 *
 * Notes:
 * - Uses VITE_API_URL if present, otherwise http://localhost:5000
 * - Expects GET /api/user/me (protected) to return the user object
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(Boolean(token && !user));

  // Helper to derive API base
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    // If there is a token but no user, fetch profile.
    // Also re-run when token changes (e.g. on login/logout).
    let cancelled = false;

    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      // If user already exists and token hasn't changed, skip fetch
      // (this keeps behaviour close to your previous implementation).
      if (user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const resp = await fetch(`${API_BASE}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!resp.ok) {
          // token invalid/expired -> clear
          setToken(null);
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setLoading(false);
          return;
        }

        // backend returns user object (not wrapped)
        const data = await resp.json();

        // If backend returns { user: {...} } handle it too
        const profile = data?.user ? data.user : data;
        if (!cancelled) {
          setUser(profile);
          localStorage.setItem("user", JSON.stringify(profile));
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth check failed", err);
        if (!cancelled) {
          // keep token as-is for now but clear user to be safe
          setUser(null);
          localStorage.removeItem("user");
          setLoading(false);
        }
      }
    };

    fetchProfile();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // only re-run when token changes

  // Called by your login flow. Keep signature same.
  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
