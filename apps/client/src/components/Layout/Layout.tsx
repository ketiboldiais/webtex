import { Outlet } from "react-router-dom";
import Navbar from "../../views/Navbar/Navbar";

// styles
import Styles from "./Styles/Layout.module.css";

export function Layout() {
  return (
    <main className={`App ${Styles.LayoutContainer}`}>
      <Navbar />
      <Outlet />
    </main>
  );
}
