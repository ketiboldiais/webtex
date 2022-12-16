import { Link, useLocation, useNavigate } from "react-router-dom";

export const DashboardHeader = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onGoHomeClicked = () => navigate("/dash");

  let goHomeButton = null;
  if (pathname !== "/dash") {
    goHomeButton = (
      <button title="Home" onClick={onGoHomeClicked}>
        Home
      </button>
    );
  }

  const content = (
    <header>
      <div>
        <Link to="/dash/notes">
          <h1>Notes</h1>
        </Link>
        <nav>{goHomeButton}</nav>
      </div>
    </header>
  );
  return content;
};
