// client/src/components/ThemeButton.jsx
import React, { useContext } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import { ThemeContext } from "../context/ThemeContext";

export default function ThemeButton({ className = "" }) {
  const { isDark, toggle } = useContext(ThemeContext);

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`p-2 rounded-md hover:scale-105 transition-transform ${className}`}
    >
      {isDark ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-700" />}
    </button>
  );
}
