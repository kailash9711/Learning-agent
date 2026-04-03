import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  // Temporary auth check (replace with AuthContext/Redux later)
  const token = localStorage.getItem("token");
  const isAuthenticated = Boolean(token);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;