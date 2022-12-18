import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// routes
import { BrowserRouter, Routes, Route } from "react-router-dom";

// styles
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
