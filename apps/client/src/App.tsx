import { Routes, Route } from "react-router-dom";
import "./App.css";

// pages

import { Layout } from "./components/Layout";
import Register from "./views/Register/Register";
import Navbar from "./views/Navbar/Navbar";
import Login from "./views/Login/Login";
import Home from "./views/Home/Home";
import Docs from "./views/Docs/Docs";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/docs" element={<Docs />} />
        {/* private routes */}
        <Route path="/home" element={<Home />} />
      </Route>
    </Routes>
  );
}

export default App;
