import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">Distributed booking platform</p>
        <h1>Book seats, manage events, and prove concurrency safety.</h1>
        <p className="hero-text">
          Browse published events, select multiple seats, join waitlists for sold-out events, and use admin tools to
          manage the full event lifecycle.
        </p>

        <div className="hero-actions button-row">
          <Link to="/events" className="button button-primary">
            Browse events
          </Link>
          <Link to="/login" className="button button-secondary">
            Log in
          </Link>
          <Link to="/register" className="button button-ghost">
            Create account
          </Link>
        </div>
      </div>

      <div className="hero-card">
        <div className="stat-card">
          <span className="stat-label">Architecture</span>
          <strong>React + 3 Spring services</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Communication</span>
          <strong>JSON REST via one gateway</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Product flow</span>
          <strong>Multi-seat booking, waitlist, and mock email evidence</strong>
        </div>
      </div>
    </section>
  );
}
