import { Link } from "react-router-dom";

// styles
import Styles from "./styles/NavBar.module.css";

function Navbar() {
  return (
    <>
      <nav className={Styles.Container}>
        <ul>
          <li>
            <Link to="/register">Register</Link>
          </li>
          <li>
            <Link to="/login">Login</Link>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default Navbar;
