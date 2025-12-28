// ==================================================
// client/src/App.jsx
// --------------------------------------------------
// Application runtime shell
// Responsibilities:
// - Routing
// - Global socket listeners
// - Token expiry auto-logout
// ==================================================

// import "./App.css";
import { BrowserRouter, useLocation } from "react-router-dom";
import { useEffect, useContext } from "react";

import AppRoutes from "./routes/AppRoutes";
import { AuthContext } from "./context/AuthContext";
import { MessageContext } from "./context/MessageContext";

import io from "socket.io-client";
import api from "./utils/api";

/* ==================================================
   Socket Initialization (Singleton)
   - Created once for entire app lifecycle
================================================== */
const socket = io("http://localhost:5000", {
  transports: ["websocket"],
});

/**
 * SocketListener
 * --------------------------------------------------
 * Listens to global socket events.
 * Does not render UI.
 * Lives inside Router to access route location.
 */
function SocketListener() {
  const { user } = useContext(AuthContext);
  const { incrementUnread } = useContext(MessageContext);
  const location = useLocation();

  /* ------------------------------------------------
     Notify backend when browser/tab closes
  ------------------------------------------------ */
  useEffect(() => {
    const handleUnload = () => {
      api.post("/session/end");
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  /* ------------------------------------------------
     Join socket room & listen for messages
  ------------------------------------------------ */
  useEffect(() => {
    if (!user?.id) return;

    // Join user-specific socket room
    socket.emit("join", user.id);

    socket.on("receiveMessage", () => {
      // Do NOT increment unread count
      // if user is already on messages page
      if (!location.pathname.includes("/messages")) {
        incrementUnread();
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [user?.id, location.pathname]);

  return null;
}

function App() {
  /* ==================================================
     Auto Logout on JWT Expiry
     - Runs once on app load
     - Clears session if token is invalid/expired
  ================================================== */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const isExpired = payload.exp * 1000 < Date.now();

      if (isExpired) {
        localStorage.clear();
        window.location.href = "/login";
      }
    } catch {
      // Malformed token → force logout
      localStorage.clear();
      window.location.href = "/login";
    }
  }, []);

  return (
    <BrowserRouter>
      {/* 🔥 Global real-time socket listener */}
      <SocketListener />

      {/* 🔀 Application routing */}
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;