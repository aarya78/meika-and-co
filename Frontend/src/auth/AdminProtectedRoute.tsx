import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function AdminProtectedRoute({
  children,
}: Props) {
  const isAuthenticated = !!localStorage.getItem("adminAuth");

  if (!isAuthenticated) return <Navigate to="/admin-login" replace />;

  return <>{children}</>;
}