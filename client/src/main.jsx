// client/src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AttendanceProvider } from "./context/AttendanceContext.jsx";
import { LeaveProvider } from "./context/LeaveContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <AttendanceProvider>
        <LeaveProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </LeaveProvider>
      </AttendanceProvider>
    </AuthProvider>
  </StrictMode>
);
