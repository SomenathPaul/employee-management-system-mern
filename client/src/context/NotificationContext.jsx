// src/context/NotificationContext.jsx
import { createContext, useEffect, useState } from "react";
import api from "../utils/api";

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);

  const LAST_SEEN_KEY = "notifications_last_seen";

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/notifications", {
        params: { page: 1, limit: 50 },
      });

      const list = res.data?.data || [];
      const lastSeen = localStorage.getItem(LAST_SEEN_KEY);

      if (!lastSeen) {
        // first time → everything is unread
        setUnreadCount(list.length);
        return;
      }

      const lastSeenDate = new Date(lastSeen);

      const unread = list.filter(
        (n) => new Date(n.createdAt) > lastSeenDate
      );

      setUnreadCount(unread.length);
    } catch (err) {
      console.error("notification count error", err);
      setUnreadCount(0);
    }
  };

  const markAllAsRead = () => {
    localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
    setUnreadCount(0);
  };

  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        refreshUnreadCount: fetchUnreadCount,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
