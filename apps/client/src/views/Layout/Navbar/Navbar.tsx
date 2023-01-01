import { useAppSelector } from "../../../hooks/useAppSelector";
import { selectLoginStatus } from "../../../model/store";
import { PrivateNav } from "./PrivateNav";
import { PublicNav } from "./PublicNav";

// styles
import Styles from "../../../styles/NavBar.module.css";


function Navbar() {
  const isLoggedIn = useAppSelector(selectLoginStatus);
  const navItems = isLoggedIn ? <PrivateNav /> : <PublicNav />;
  return <nav className={Styles.Container}>{navItems}</nav>;
}

export default Navbar;
