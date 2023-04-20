import css from "./App.module.scss";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/home.page.js";
import Plot2DPage from "./pages/plot2d.page";
import Layout from "./layout";
import GraphPage from "./pages/graph.page";

function App() {
  return (
    <div className={css.app}>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path={"/"} element={<Home />} />
            <Route path={"plot2d"} element={<Plot2DPage />} />
            <Route path={"graph"} element={<GraphPage />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
