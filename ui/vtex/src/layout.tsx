import { NavLink, Outlet } from "react-router-dom";
export default function Layout() {
  const navLinks = [
    { href: "/", title: "Introduction" },
    { href: "plot2d", title: "Plot2D" },
    { href: "graph", title: "Graph" },
  ];
  <li>
    <NavLink to={"/"}>Home</NavLink>
  </li>;
  return (
    <div>
      <header>@webtex/vtex</header>
      <div>
        <aside>
          <nav>
            <ul>
              {navLinks.map(({ href, title }) => (
                <li key={title}>
                  <NavLink to={href}>
                    <span>{title}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
				<main>
					<Outlet/>
				</main>
      </div>
    </div>
  );
}
