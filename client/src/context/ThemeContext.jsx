// client/src/context/ThemeContext.jsx
import React, { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext({
  isDark: false,
  toggle: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // initial from localStorage or system preference fallback
    try {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });

  // Ensure html attribute matches state on mount and state change
  useEffect(() => {
    const html = document.documentElement;
    if (isDark) html.setAttribute("data-theme", "dark");
    else html.removeAttribute("data-theme");
  }, [isDark]);

  // toggle with a short transition helper:
  const toggle = () => {
    const html = document.documentElement;
    // add transition helper so CSS animates
    html.classList.add("theme-transition");
    // small setTimeout to ensure class applied before changing theme
    setTimeout(() => {
      setIsDark(prev => {
        const next = !prev;
        try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
        return next;
      });
      // remove transition helper after duration
      setTimeout(() => html.classList.remove("theme-transition"), 420);
    }, 10);
  };

  return <ThemeContext.Provider value={{ isDark, toggle }}>{children}</ThemeContext.Provider>;
};
