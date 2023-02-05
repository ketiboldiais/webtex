import { Link, Outlet } from 'react-router-dom';
import Navbar from './Navbar/Navbar';

// styles
import Styles from '@styles/Layout.module.css';

export function Layout() {
  return (
    <div className={Styles.App}>
      <main className={Styles.LayoutContainer}>
        <header>
          <h1>
            <Link to='main'>Webtex</Link>
          </h1>
          <h1>
            <Link to='docs'>Docs</Link>
          </h1>
          {/* <Navbar /> */}
        </header>
        <article className={Styles.mainContent}>
          <Outlet />
        </article>
      </main>
    </div>
  );
}
