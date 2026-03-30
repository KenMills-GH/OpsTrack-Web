import { Navigate, Outlet, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  requiredRole?: string;
}

function getTokenPayload() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split(".")[1])) as Record<string, string>;
  } catch {
    return null;
  }
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requiredRole) {
    const payload = getTokenPayload();
    const role = payload?.role || payload?.userRole;
    if (!role || role.toLowerCase() !== requiredRole.toLowerCase()) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
}
