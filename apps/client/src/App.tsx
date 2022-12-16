import { Routes, Route } from "react-router-dom";
import "./App.css";

// pages

import { Layout } from "./components/Layout/Layout";
import Register from "./views/Register/Register";
import Login from "./views/Login/Login";
import Home from "./views/Home/Home";
import Docs from "./views/Docs/Docs";
import { RequireAuth } from "./model/state/RequireAuth";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/docs" element={<Docs />} />
        {/* protected routes */}
        <Route element={<RequireAuth />}>
          <Route path="/home" element={<Home />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
