import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function CustomerRoute({ children, requireAuth = false }) {
  const { user, authLoading } = useApp();
  if (authLoading) return <main className="container-x py-20 text-center">Checking your session...</main>;
  if (user?.role === "admin") return <Navigate to="/admin" replace />;
  if (requireAuth && !user) return <Navigate to="/auth" replace />;
  return children;
}
