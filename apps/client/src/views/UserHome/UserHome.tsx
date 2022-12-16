import { Link } from "react-router-dom";

export const UserHome = () => {
  const content = (
    <section>
      {/* insert user email here */}
      <p>
        <Link to="/dash/notes">Notes</Link>
      </p>
      <p>
        <Link to="/dash/settings">Settings</Link>
      </p>
    </section>
  );

  return content;
};
