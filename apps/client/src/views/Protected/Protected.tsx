import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../hooks/useAppSelector";
import { selectToken } from "../../model/store";

export const Protected = () => {
  const token = useAppSelector(selectToken);
  const location = useLocation();

  return token ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};
