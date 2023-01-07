import { Routes, Route } from 'react-router-dom';
import '@styles/App.module.css';

// pages
import { Layout } from './views/Layout/Layout';
import Main from './views/Public/Main';
import Docs from './views/Public/Docs';
import { Missing } from './views/Public/Missing';
import Workspace from './views/Protected/Workspace/Workspace';
import { Protected } from './views/Protected/Protected';
import { useAppSelector, selectLoginStatus } from './model/store';
import { Suspense, lazy } from 'react';

const Register = lazy(() => import('./views/Public/Register'));
const Login = lazy(() => import('./views/Public/Login'));
const Notes = lazy(() => import('./views/Protected/Notes'));
const Settings = lazy(() => import('./views/Protected/Settings'));

function App() {
  const session = useAppSelector(selectLoginStatus);
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={session ? <Docs /> : <Main />} />
        <Route
          path='login'
          element={
            <Suspense fallback={<>...</>}>
              <Login />
            </Suspense>
          }
        />
        <Route
          path='register'
          element={
            <Suspense fallback={<>...</>}>
              <Register />
            </Suspense>
          }
        />
        <Route path='main' element={<Main />} />
        <Route path='docs' element={<Docs />} />
        <Route element={<Protected />}>
          <Route index element={<Workspace />} />
          <Route
            path='notes'
            element={
              <Suspense fallback={<>...</>}>
                <Notes />
              </Suspense>
            }
          />
          <Route
            path='settings'
            element={
              <Suspense fallback={<>...</>}>
                <Settings />
              </Suspense>
            }
          />
        </Route>
        <Route path='*' element={<Missing />} />
      </Route>
    </Routes>
  );
}

export default App;
