// client/src/user-pages/employee/profile/ProfileTab.jsx
import React, { useContext } from "react";
import { FaUserEdit } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import { ThemeContext } from "../../../context/ThemeContext";

function ProfileTab() {
  const { isDark } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  let navUser = user.role.toLowerCase();

  return (
    <div
      className={`h-full shadow-md overflow-y-auto ${
        isDark ? "bg-app" : "bg-white"
      }`}
    >
      {/* Header */}
      <div
        className={`flex flex-col md:flex-row items-center justify-between mb-6 border-b-2 border-b-black/20 p-8 ${
          isDark ? "bg-blue-900/30" : "bg-blue-50"
        }`}
      >
        <div className="flex items-center space-x-4">
          <img
            src={`http://localhost:5000/uploads/${user.photo}`}
            alt="Profile"
            className="w-24 h-24 rounded-full shadow-md border-2 border-indigo-500"
          />
          <div>
            <h2
              className={`text-2xl font-semibold text-gray-800 ${
                isDark ? "text-app" : "text-app"
              }`}
            >
              {user.name}
              <span className="text-sm text-gray-400"> ({user.role})</span>
            </h2>
            <p className="text-gray-500">{user.designation}</p>
            <p className="text-sm text-gray-400">{user.department}</p>
          </div>
        </div>

        <NavLink to={`/${navUser}/settings`}>
          <button
            href="/"
            className="flex items-center mt-4 md:mt-0 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-all"
          >
            <FaUserEdit className="mr-2" /> Edit Profile
          </button>
        </NavLink>
      </div>

      {/* Profile Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-8">
        {/* Basic Info */}
        <div
          className={` rounded-2xl p-5 shadow-sm ${
            isDark ? "text-gray-200 bg-white/10" : "text-gray-700 bg-gray-50"
          }`}
        >
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <ul
            className={`space-y-2 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            <li>
              <strong>Email:</strong> {user.email}
            </li>
            <li>
              <strong>Phone:</strong> {user.phone}
            </li>
            <li>
              <strong>Gender:</strong> {user.gender}
            </li>
            <li>
              <strong>Date of Joining:</strong>{" "}
              {new Date(user.joiningDate).toLocaleDateString()}
            </li>
          </ul>
        </div>

        {/* Address Info */}
        <div
          className={`rounded-2xl p-5 shadow-sm ${
            isDark ? "text-gray-200 bg-white/10" : "text-gray-700 bg-gray-50"
          }`}
        >
          <h3 className="text-lg font-semibold mb-4">Address Information</h3>
          <p
            className={`space-y-2 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {user.address} <br /> City- {user.city}
            <br /> State- {user.state}
            <br /> Pincode- {user.pincode}
            <br /> Country- {user.country}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProfileTab;
