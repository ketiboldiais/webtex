/* eslint-disable no-undef */
import { BrowserRouter, Link, Outlet, Route, Routes } from "react-router-dom";
import css from "./App.module.scss";
import MainPage from "./docs/main.mdx";
import PlotDoc from "./docs/plot.mdx";
import GraphDoc from "./docs/graph.mdx";
import TreeDoc from "./docs/tree.mdx";
import VectorDoc from "./docs/vector.mdx";

import { ReactNode, useEffect, useState } from "react";

export const docLinks = {
  Intro: "/",
  Plots: "/plot",
  Graphs: "/graph",
  Trees: "/tree",
  Vectors: "/vector",
};

export const Pages = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Page />}>
          <Route path={docLinks.Intro} element={<MainPage />} />
          <Route path={docLinks.Plots} element={<PlotDoc />} />
          <Route path={docLinks.Graphs} element={<GraphDoc />} />
          <Route path={docLinks.Trees} element={<TreeDoc />} />
          <Route path={docLinks.Vectors} element={<VectorDoc />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

function Nav({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const attribute = "(prefers-color-scheme: dark)";
    const prefersDark = window.matchMedia(attribute);
    if (prefersDark.matches) {
      setDark(true);
    }
    prefersDark.addEventListener("change", (e) => setDark(e.matches));
  }, []);
  return (
    <div className={dark ? css.dark : css.light}>
      <nav className={css.nav}>
        <ul>
          {Object.entries(docLinks).map(([name, path]) => (
            <li key={name + path}>
              <Link to={path}>{name}</Link>
            </li>
          ))}
        </ul>
        <button onClick={() => setDark(!dark)}>
          {dark ? "\u263c" : "\u263d"}
        </button>
      </nav>
      {children}
    </div>
  );
}

function Page() {
  return (
    <Nav>
      <main>
        <article>
          <Outlet />
        </article>
      </main>
    </Nav>
  );
}
