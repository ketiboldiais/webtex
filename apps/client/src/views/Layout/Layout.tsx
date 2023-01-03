import { Link, Outlet } from "react-router-dom";
import Navbar from "./Navbar/Navbar";

// styles
import Styles from "@styles/Layout.module.css";

export function Layout() {
  return (
    <main className={`App ${Styles.LayoutContainer}`}>
      <header>
        <h1>
          <Link to="docs">Webtex</Link>
        </h1>
        <Navbar />
      </header>
      <article className={Styles.mainContent}>
        <Outlet />
      </article>
    </main>
  );
}