// client/src/user-pages/manager/tasks/ManagerTask.jsx
import React from "react";
import ManagerDashboardLayout from "../ManagerDashboardLayout";
import TaskTab from "./TaskTab";

function ManagerTask() {
  return (
    <>
      <ManagerDashboardLayout content={<TaskTab />} />
    </>
  );
}

export default ManagerTask;
