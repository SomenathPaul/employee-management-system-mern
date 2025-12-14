// client/src/user-pages/employee/messages/EmpMessages.jsx
import React from "react";
import EmpDashboardLayout from "../EmpDashboardLayout";
import MessagesTab from "./MessagesTab";

function EmpMessages() {
  return (
    <>
      <EmpDashboardLayout content={<MessagesTab />} />
    </>
  );
}

export default EmpMessages;
