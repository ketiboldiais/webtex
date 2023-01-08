import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@model/store';
import { selectLoginStatus } from '@model/store';

export const Protected = () => {
  const session = useAppSelector(selectLoginStatus);
  const location = useLocation();

  if (!session) {
    return <Navigate to='/login' state={{ from: location }} />;
  }

  return <Outlet />;
};
