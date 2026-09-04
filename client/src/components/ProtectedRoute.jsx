import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, authLoading } = useApp();

  if (authLoading) {
    return <main className="container-x py-20 text-center">Checking your session...</main>;
  }

  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If route requires admin role and user is not an admin, redirect to home
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
