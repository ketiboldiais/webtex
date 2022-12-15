import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// rotes
import { BrowserRouter, Routes, Route } from "react-router-dom";
// redux
import { store } from "./model/state/store";
import { Provider } from "react-redux";
// styles
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
