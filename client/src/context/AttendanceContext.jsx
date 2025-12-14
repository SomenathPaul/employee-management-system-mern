// client/src/context/AttendanceContext.jsx
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AttendanceContext = createContext();

export const AttendanceProvider = ({ children }) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/attendance/get", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendance(res.data);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setAttendance([]); // ensure empty array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  return (
    <AttendanceContext.Provider value={{ attendance, loading, fetchAttendance }}>
      {children}
    </AttendanceContext.Provider>
  );
};
