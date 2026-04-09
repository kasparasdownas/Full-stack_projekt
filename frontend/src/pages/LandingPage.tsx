import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">Distributed booking platform</p>
        <h1>Browse events and reserve seats without double booking.</h1>
        <p className="hero-text">
          The current slice already covers identity, event browsing, live seat availability, and single-seat booking on
          top of a concurrency-safe shared schema.
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
