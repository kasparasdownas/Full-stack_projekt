import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useCurrentUserQuery, useLogoutMutation } from '../features/auth/useAuth';

export function AppShell() {
  const navigate = useNavigate();
  const currentUserQuery = useCurrentUserQuery();
  const logoutMutation = useLogoutMutation();
  const [logoutError, setLogoutError] = useState<string | null>(null);

  async function handleLogout() {
    setLogoutError(null);

    try {
      await logoutMutation.mutateAsync();
      navigate('/');
    } catch {
      setLogoutError('Unable to log out right now.');
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          Distributed Event Booking
        </Link>

        <nav className="topbar-nav">
          <Link to="/events">Events</Link>
          {currentUserQuery.data ? (
            <>
              <Link to="/bookings">My bookings</Link>
              <span className="topbar-user">
                {currentUserQuery.data.name} ({currentUserQuery.data.role})
              </span>
              <button
                className="button button-secondary topbar-button"
                type="button"
                disabled={logoutMutation.isPending}
                onClick={() => void handleLogout()}
              >
                {logoutMutation.isPending ? 'Logging out...' : 'Log out'}
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>

      <main className="page-container">
        {logoutError ? <div className="panel error-panel topbar-error">{logoutError}</div> : null}
        <Outlet />
      </main>
    </div>
  );
}
