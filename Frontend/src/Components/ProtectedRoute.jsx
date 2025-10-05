import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem("token"); // updated key
  const userRaw = localStorage.getItem("userDetails");
  const user = userRaw ? JSON.parse(userRaw) : null;

  // No token or no user -> unauthorized
  if (!token || !user) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Role-based protection
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
