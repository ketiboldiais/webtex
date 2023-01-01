import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppSelector';
import { selectLoginStatus } from '../../model/store';

export const Protected = () => {
  const session = useAppSelector(selectLoginStatus);
  const location = useLocation();
  
  

  return <Outlet />;
};
