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

        <nav className="topbar-nav" aria-label="Main navigation">
          <div className="topbar-links">
            <Link className="nav-pill" to="/events">Events</Link>
            {currentUserQuery.data ? <Link className="nav-pill" to="/bookings">My bookings</Link> : null}
            {currentUserQuery.data?.role === 'ADMIN' ? (
              <>
                <Link className="nav-pill" to="/admin/events">Admin events</Link>
                <Link className="nav-pill" to="/admin/email-outbox">Email outbox</Link>
              </>
            ) : null}
          </div>
          {currentUserQuery.data ? (
            <div className="topbar-session">
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
            </div>
          ) : (
            <div className="topbar-session">
              <Link className="nav-pill" to="/login">Log in</Link>
              <Link className="nav-pill nav-pill-primary" to="/register">Register</Link>
            </div>
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
