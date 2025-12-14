// client/src/user-pages/manager/ManagerLogout.jsx
import React from 'react'
import ManagerDashboardLayout from "./ManagerDashboardLayout";
import LogoutTab from '../../components/logout/LogoutTab'

function ManagerLogout() {
  return (
    <>
      <ManagerDashboardLayout
      content={<LogoutTab />}
      />
    </>
  )
}

export default ManagerLogout