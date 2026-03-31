import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isTokenExpired, readTokenPayload } from "../utils/authToken";

interface ProtectedRouteProps {
  requiredRole?: string;
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const payload = readTokenPayload();

  if (!token || !payload || isTokenExpired(payload)) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requiredRole) {
    const role = payload?.role || payload?.userRole;
    if (
      typeof role !== "string" ||
      role.toLowerCase() !== requiredRole.toLowerCase()
    ) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
}
