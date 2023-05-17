/* eslint-disable no-undef */
import { BrowserRouter, Link, Outlet, Route, Routes } from "react-router-dom";
import css from "./App.module.scss";
import MainPage from "./docs/main.mdx";
import TreePage from "./docs/tree.doc.mdx";
import GraphPage from "./docs/graph.doc.mdx";
import Plot2DPage from "./docs/plot2d.doc.mdx";
import LangDemo from './docs/lang.doc.mdx';
import { ReactNode, useEffect, useState } from "react";

export const docLinks = {
  Intro: "/",
  Graphs: "/graph",
  Trees: "/tree",
  Plot2D: "/plot2d",
  Skim: "/skim",
};

export const Pages = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Page />}>
          <Route path={docLinks.Intro} element={<MainPage />} />
          <Route path={docLinks.Trees} element={<TreePage />} />
          <Route path={docLinks.Graphs} element={<GraphPage />} />
          <Route path={docLinks.Plot2D} element={<Plot2DPage />} />
          <Route path={docLinks.Skim} element={<LangDemo />} />
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
