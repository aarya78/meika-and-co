import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute() {
  // PrivateRoute.tsx & PublicRoute.tsx
  const isAuthenticated = !!localStorage.getItem("adminAuth"); // true if anything is stored

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/admin-login" replace />
  );
}