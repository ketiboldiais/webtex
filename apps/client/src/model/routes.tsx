import { Navigate, Outlet } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { Layout } from 'src/views/Layout/Layout';
import Docs from 'src/views/Public/Docs';
import Login from 'src/views/Public/Login';
import { Notes } from 'src/views/Protected/Notes';
import Register from 'src/views/Public/Register';
import Workspace from 'src/views/Protected/Workspace/Workspace';

export function appRouter(isLoggedIn: boolean): RouteObject[] {
  return [
    { index: true, element: isLoggedIn ? <Docs /> : <Workspace /> },
    { path: 'login', element: <Login /> },
    { path: 'register', element: <Register /> },
    {
      path: 'notes',
      element: isLoggedIn ? <Notes /> : <Navigate to='/login' />,
    },
    {
      path: 'home',
      element: isLoggedIn ? <Notes /> : <Navigate to='/login' />,
    },
  ];
}
