import { Routes, Route } from "react-router-dom";
import "./App.css";

// pages

import { Layout } from "./components/Layout/Layout";
import Register from "./views/Register/Register";
import Login from "./views/Login/Login";
import Docs from "./views/Docs/Docs";
import { UserHome } from "./views/UserHome/UserHome";
import { RequireAuth } from "./model/state/RequireAuth";
import { DashboardLayout } from "./components/DashboardLayout/DashboardLayout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Docs />} />
        {/* public routes */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        {/* protected routes */}
        <Route element={<RequireAuth />}>
          <Route path="dash" element={<DashboardLayout />}>
            <Route index element={<UserHome />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
