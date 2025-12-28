// ==================================================
// client/src/main.jsx
// --------------------------------------------------
// Application entry point
// - Mounts React to the DOM
// - Registers ALL global context providers
// - Keeps App.jsx clean and focused on runtime logic
// ==================================================

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App.jsx";

/* ========== Global Context Providers ========== */
/* These providers wrap the entire application
   and should NEVER be duplicated elsewhere */
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LeaveProvider } from "./context/LeaveContext";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { MessageProvider } from "./context/MessageContext.jsx";
import { TaskProvider } from "./context/TaskContext.jsx";

/**
 * Provider hierarchy (important):
 * - AuthProvider → authentication & user state
 * - ThemeProvider → UI theme (light/dark)
 * - Feature providers layered inside
 */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <LeaveProvider>
          <NotificationProvider>
            <MessageProvider>
              <TaskProvider>
                <App />
              </TaskProvider>
            </MessageProvider>
          </NotificationProvider>
        </LeaveProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
);
