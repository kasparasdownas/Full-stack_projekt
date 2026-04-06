import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">Iteration 1</p>
        <h1>Distributed event discovery with a booking-safe data model.</h1>
        <p className="hero-text">
          This first iteration ships the read flow: identity, event browsing, event detail, and live seat
          availability built on top of the shared schema that will support safe concurrent booking next.
        </p>

        <div className="hero-actions">
          <Link to="/register" className="button button-primary">
            Create account
          </Link>
          <Link to="/login" className="button button-secondary">
            Log in
          </Link>
          <Link to="/events" className="button button-ghost">
            Browse events
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
          <span className="stat-label">Concurrency guard</span>
          <strong>Unique booking seat constraint already present</strong>
        </div>
      </div>
    </section>
  );
}

