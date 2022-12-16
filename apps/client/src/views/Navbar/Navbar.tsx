import { Link, Outlet } from "react-router-dom";

// styles
import Styles from "./styles/NavBar.module.css";

function Navbar() {
  return (
    <>
      <nav className={Styles.Container}>
        <ul>
          <li className={Styles.webtexTitle}>
            <Link to="/docs">Webtex</Link>
          </li>
          <li>
            <Link to="/register">Register</Link>
          </li>
          <li>
            <Link to="/login">Login</Link>
          </li>
          <li>
            <Link to="/home">Home</Link>
          </li>
          <li role="button">
            <a>Logout</a>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default Navbar;
