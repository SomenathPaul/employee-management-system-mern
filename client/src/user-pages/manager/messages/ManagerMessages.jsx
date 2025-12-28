// client/src/user-pages/manager/messages/ManagerMessages.jsx
import React from "react";
import ManagerDashboardLayout from "../ManagerDashboardLayout";
import MessagesTab from "../../../components/messages/MessagesTab";

function ManagerMessages() {
  return (
    <>
      <ManagerDashboardLayout content={<MessagesTab />} />
    </>
  );
}

export default ManagerMessages;
