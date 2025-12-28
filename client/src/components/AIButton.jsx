import React from "react";
import { HiSparkles } from "react-icons/hi2";

/**
 * AIButton Component
 * Optimized for Tailwind CSS v4 + Vite
 * * @param {string} name - Context label (e.g., "Reason")
 * @param {function} onClick - Trigger function
 * @param {boolean} isLoading - State for async processing
 */
function AIButton({ name, onClick, isLoading = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="
        /* Layout */
        relative flex items-center justify-center gap-2 
        w-full sm:w-auto sm:min-w-[220px] px-6 py-2.5 m-2
        
        /* Typography */
        text-white font-bold text-sm tracking-wide
        
        /* v4 Gradient and Custom Utility */
        bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 
        animate-gradient-slow
        
        /* Borders and Shape */
        rounded-xl border border-white/20
        
        /* Interactions */
        shadow-lg shadow-purple-500/30
        hover:shadow-purple-500/50 hover:-translate-y-0.5 hover:scale-[1.02]
        active:scale-95 cursor-pointer transition-all duration-300
        
        /* Logic States */
        disabled:opacity-70 disabled:cursor-not-allowed
      "
    >
      {/* Loading Spinner or AI Icon */}
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <HiSparkles className="text-lg animate-pulse" />
      )}

      <span className="truncate">
        {isLoading ? "Processing..." : `Enhance ${name} with AI`}
      </span>

      {/* Glossy Overlay effect */}
      <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
    </button>
  );
}

export default AIButton;