// client/src/components/AttendanceButton.jsx
import React, { useContext, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { AuthContext } from "../context/AuthContext";

const AttendanceButton = () => {
  const { user } = useContext(AuthContext); // ensure AuthContext provides user
  const [buttonText, setButtonText] = useState("Mark Attendance");
  const [disabled, setDisabled] = useState(false);

  // let text = "Mark Attendance";

  const handleMarkAttendance = async () => {
    if (!user) {
      Swal.fire("Not signed in", "Please login first.", "warning");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/attendance/mark",
        {
          employeeId: user.employeeId,
          name: user.name,
          role: user.role,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Success (201)
      Swal.fire({
        icon: "success",
        title: "Attendance marked",
        text: res.data.msg || "Attendance marked successfully",
        timer: 2000,
        showConfirmButton: false,
      });
      setButtonText("Attendance Done");
      setDisabled(true);
    } catch (err) {
      // If server responded with JSON (e.g., 400) then show that message
      const status = err.response?.status;
      const serverMsg = err.response?.data?.msg;

      if (status === 400 && serverMsg) {
        // Duplicate attendance / business validation
        Swal.fire({
          icon: "info",
          title: "Already marked",
          html: serverMsg,
        });
        setButtonText("Attendance Done");
        setDisabled(true);
        return;
      }

      if (status === 401) {
        // Unauthorized
        Swal.fire({
          icon: "warning",
          title: "Not authorized",
          text: serverMsg || "Please login again.",
        });
        // optionally redirect to login:
        // window.location.href = "/login";
        return;
      }

      // Generic fallback
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: serverMsg || err.message || "Unable to mark attendance.",
      });
    }
  };

  return (
    <button
      onClick={handleMarkAttendance}
      disabled={disabled}
      className={`px-4 py-2 rounded text-white font-medium transition ${
        disabled
          ? "bg-gray-500 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
      }`}
    >
      {buttonText}
    </button>
  );
};

export default AttendanceButton;
