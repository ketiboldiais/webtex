import { Link } from "react-router-dom";

export const PrivateNav = () => {
  return (
    <ul>
      <li>
        <Link to="notes">Notes</Link>
      </li>
      <li>
        <Link to="workspace">Workspace</Link>
      </li>
      <li>
        <Link to="settings">Settings</Link>
      </li>
    </ul>
  );
};
