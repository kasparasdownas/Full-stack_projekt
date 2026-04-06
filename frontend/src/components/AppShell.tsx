import { Link, Outlet } from 'react-router-dom';
import { useCurrentUserQuery } from '../features/auth/useAuth';

export function AppShell() {
  const currentUserQuery = useCurrentUserQuery();

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          Distributed Event Booking
        </Link>

        <nav className="topbar-nav">
          <Link to="/events">Events</Link>
          {currentUserQuery.data ? (
            <span className="topbar-user">
              {currentUserQuery.data.name} ({currentUserQuery.data.role})
            </span>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>

      <main className="page-container">
        <Outlet />
      </main>
    </div>
  );
}

