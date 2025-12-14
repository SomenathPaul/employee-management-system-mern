// client/src/components/logout/LogoutTab.jsx
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { ThemeContext } from "../../context/ThemeContext";

function LogoutTab() {
  const navigate = useNavigate();
  const { isDark } = useContext(ThemeContext);

  // Theme classes
  const containerBg = isDark ? "bg-app text-gray-200" : "bg-white text-gray-800";
  const secondaryBtn = isDark
    ? "bg-slate-700 text-gray-200 hover:bg-slate-600"
    : "bg-gray-200 text-gray-700 hover:bg-gray-300";
  const dangerBtn = isDark
    ? "bg-red-600 text-white hover:bg-red-700"
    : "bg-red-500 text-white hover:bg-red-600";
  const hintText = isDark ? "text-gray-300" : "text-gray-500";

  // Handle Logout Function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Navigate first so UI updates, then show confirmation
    navigate("/login");

    Swal.fire("You are logged out", "You have been logged out successfully!", "success");
  };

  return (
    <div className={`h-full shadow-md p-6 flex flex-col items-center justify-center ${containerBg}`}>
      <div className={`w-full max-w-md p-6 rounded-lg`}>
        <div className="flex flex-col items-center">
          <img src="/user.gif" alt="logout" className="w-40 mb-4" />
          <p className={`text-center mb-6 ${hintText}`}>
            Oh no! You are leaving... Are you sure?
          </p>

          <div className="flex gap-4">
            <button
              onClick={handleLogout}
              className={`${dangerBtn} px-6 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer`}
            >
              Yes, Logout
            </button>

            <button
              onClick={() => navigate(-1)}
              className={`${secondaryBtn} px-6 py-2 rounded-lg transition cursor-pointer`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogoutTab;
