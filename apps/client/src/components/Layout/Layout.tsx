import { Link, Outlet } from "react-router-dom";
import Navbar from "../../views/Navbar/Navbar";

// styles
import Styles from "./Styles/Layout.module.css";

export function Layout() {
  return (
    <main className={`App ${Styles.LayoutContainer}`}>
      <header>
        <h1>
          <Link to="/docs">Webtex</Link>
        </h1>
        <Navbar />
      </header>
      <Outlet />
    </main>
  );
}
