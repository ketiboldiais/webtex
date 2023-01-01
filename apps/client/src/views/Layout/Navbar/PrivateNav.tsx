import { Link } from "react-router-dom";

export const PrivateNav = () => {
  return (
    <ul>
      <li>
        <Link to="notes">Notes</Link>
      </li>
      <li>
        <Link to="home">Workspace</Link>
      </li>
      <li>
        <Link to="settings">Settings</Link>
      </li>
      <li>
        <button>Logout</button>
      </li>
    </ul>
  );
};
