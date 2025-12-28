import api from "./api";

// today attendance
export const getTodayAttendance = () =>
  api.get("/attendance/today");

// full history
export const getMyAttendance = () =>
  api.get("/attendance/me");

// logout (this triggers attendance close)
export const logoutUser = () =>
  api.post("/auth/logout");
