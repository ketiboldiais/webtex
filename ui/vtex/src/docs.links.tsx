/* eslint-disable no-undef */
import { BrowserRouter, Link, Outlet, Route, Routes } from "react-router-dom";
import css from "./App.module.scss";
import Main from "./docs/main.mdx";
import Graph from "./docs/graph.mdx";
import DataTypes from "./docs/dataTypes.mdx";
import Atom from "./docs/atom.mdx";
import Plot2D from "./docs/plot2D.mdx";
import Tree from "./docs/trees.mdx";
import { ReactNode, useState } from "react";

export const docLinks = {
  Intro: "/",
  Atom: "/atom",
  Graph: "/graph",
  Plot2D: "/plot2d",
  Trees: "/tree",
  ADTs: "/datatypes",
};

export const Pages = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Page />}>
          <Route path={docLinks.Intro} element={<Main />} />
          <Route path={docLinks.Graph} element={<Graph />} />
          <Route path={docLinks.ADTs} element={<DataTypes />} />
          <Route path={docLinks.Atom} element={<Atom />} />
          <Route path={docLinks.Plot2D} element={<Plot2D />} />
          <Route path={docLinks.Trees} element={<Tree />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

function Nav({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(true);
  return (
    <div className={darkMode ? css.dark : css.light}>
      <nav className={css.nav}>
        <ul>
          {Object.entries(docLinks).map(([name, path]) => (
            <li key={name + path}>
              <Link to={path}>{name}</Link>
            </li>
          ))}
        </ul>
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "\u263c" : "\u263d"}
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
