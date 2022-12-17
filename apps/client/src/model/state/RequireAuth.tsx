import { useLocation, Navigate, Outlet } from "react-router-dom";

export const RequireAuth = () => {
  const token = false;
  const location = useLocation();

  return token ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};
