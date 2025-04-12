"use client"

import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import UsersLayout from "./layout"
import UsersListPage from "./list/page"
import AddUserPage from "./add/page"
import RolesPage from "./roles/page"
import UserActivityPage from "./activity/page"

export function UsersRoutes() {
  const location = useLocation()

  // Redirect to list page if on root users path
  if (location.pathname === "/users") {
    return <Navigate to="/users/list" replace />
  }

  return (
    <UsersLayout>
      <Routes>
        <Route index element={<Navigate to="/users/list" replace />} />
        <Route path="list" element={<UsersListPage />} />
        <Route path="add" element={<AddUserPage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="activity" element={<UserActivityPage />} />
        <Route path="*" element={<Navigate to="/users/list" replace />} />
      </Routes>
    </UsersLayout>
  )
}

// Keep default export for backward compatibility
export default UsersRoutes 