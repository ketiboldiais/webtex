/* eslint-disable no-undef */
import { BrowserRouter, Link, Outlet, Route, Routes } from "react-router-dom";
import css from "./App.module.scss";
import Main from "./docs/main.mdx";
import Tree from "./docs/trees.mdx";
import GraphPage from './docs/graph.doc.mdx';
import { ReactNode, useEffect, useState } from "react";

export const docLinks = {
  Intro: "/",
  Graphs: '/graph',
  Trees: "/tree",
};

export const Pages = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Page />}>
          <Route path={docLinks.Intro} element={<Main />} />
          <Route path={docLinks.Trees} element={<Tree />} />
          <Route path={docLinks.Graphs} element={<GraphPage />} />
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
