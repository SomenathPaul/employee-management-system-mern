// client/src/user-pages/employee/tasks/EmpTask.jsx
import React from "react";
import EmpDashboardLayout from "../EmpDashboardLayout";
import TaskTab from "./TaskTab";

function EmpTask() {
  return (
    <>
      <EmpDashboardLayout content={<TaskTab />} />
    </>
  );
}

export default EmpTask;
