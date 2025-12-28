// client/src/pages/Unauthorized.jsx
import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
const userBlock = "/user-block.gif";

const Unauthorized = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // safe normalized role -> path
  const rolePath = user?.role ? `/${String(user.role).toLowerCase()}/dashboard` : null;

  const handleTryAgain = () => {
    if (rolePath) {
      navigate(rolePath);
      window.location.reload();
    } else {
      // if no role (not logged in) send to login
      navigate("/login");
    }
  };

  const handleLogout = () => {
    // optional: give user a way to logout and re-login
    if (logout) logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen text-center bg-gradient-to-br from-blue-600 to-purple-600 w-screen p-6">
      <img
        src={userBlock}
        alt="Access denied"
        className="rounded-full w-20 h-20 mb-4 object-cover shadow-lg"
      />

      <h3 className="text-3xl font-bold text-white mb-2">Access Denied</h3>

      <p className="text-gray-200 font-normal text-[18px] max-w-xl">
        You do not have permission to view this page.
      </p>

      <div className="flex gap-3 mt-6">
        {rolePath ? (
          <button
            onClick={handleTryAgain}
            className="px-4 py-2 rounded bg-white/10 border border-white/30 text-white hover:bg-white/20 transition"
          >
            Click here to try again
          </button>
        ) : (
          <NavLink to="/login" className="px-4 py-2 rounded bg-white text-black">
            Login
          </NavLink>
        )}

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
