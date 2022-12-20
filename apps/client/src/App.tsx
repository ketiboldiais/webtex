import { Routes, Route } from "react-router-dom";
import "./App.css";

// pages

import { Layout } from "./components/Layout/Layout";
import Register from "./views/Register/Register";
import Login from "./views/Login/Login";
import Docs from "./views/Docs/Docs";
import { Missing } from "./views/Missing/Missing";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Docs />} />
        {/* public routes */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        {/* protected routes */}
        {/* show 404 for everything other than the paths above */}
        <Route path="*" element={<Missing />} />
      </Route>
    </Routes>
  );
}

export default App;
