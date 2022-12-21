import { useAppSelector } from "../../hooks/useAppSelector";
import { selectToken } from "../../model/store";

// styles
import Styles from "./styles/NavBar.module.css";
import { PrivateNav } from "../PrivateNav/PrivateNav";
import { PublicNav } from "../PublicNav/PublicNav";

function Navbar() {
  const token = useAppSelector(selectToken);
  const navItems = token ? <PrivateNav /> : <PublicNav />;
  return <nav className={Styles.Container}>{navItems}</nav>;
}

export default Navbar;
