import { Link } from 'react-router-dom';
import { ApiError } from '../api/client';
import { useEventStatusMutation, useAdminEventsQuery } from '../features/events/useEvents';

export function AdminEventsPage() {
  const eventsQuery = useAdminEventsQuery();
  const statusMutation = useEventStatusMutation();

  async function runAction(eventId: string, action: 'publish' | 'unpublish' | 'cancel' | 'delete') {
    await statusMutation.mutateAsync({ eventId, action });
  }

  if (eventsQuery.isLoading) {
    return <div className="panel">Loading admin events...</div>;
  }

  if (eventsQuery.isError || !eventsQuery.data) {
    return <div className="panel error-panel">Unable to load admin events right now.</div>;
  }

  return (
    <section className="stack">
      <div className="panel detail-hero">
        <div>
          <p className="eyebrow">Admin dashboard</p>
          <h1>Manage events</h1>
          <p className="muted">Edit events, control publication state, inspect bookings, and delete only safe empty events.</p>
        </div>
        <Link to="/admin/events/new" className="button button-primary">
          Create event
        </Link>
      </div>

      {statusMutation.error instanceof ApiError ? (
        <div className="inline-error" role="alert">
          {statusMutation.error.message}
        </div>
      ) : null}

      <div className="admin-event-grid">
        {eventsQuery.data.map((event) => (
          <article key={event.id} className="panel admin-event-card">
            <div>
              <span className={`status-pill status-${event.status.toLowerCase()}`}>{event.status}</span>
              <h2>{event.title}</h2>
              <p className="muted">
                {new Date(event.dateTime).toLocaleString()} · {event.venue}
              </p>
            </div>
            <div className="detail-stats compact-stats">
              <div className="stat-card">
                <span className="stat-label">Seats</span>
                <strong>{event.seatsTotal}</strong>
              </div>
              <div className="stat-card">
                <span className="stat-label">Free</span>
                <strong>{event.seatsAvailable}</strong>
              </div>
              <div className="stat-card">
                <span className="stat-label">Bookings</span>
                <strong>{event.bookingCount}</strong>
              </div>
            </div>
            <div className="action-row">
              <Link to={`/events/${event.id}`} className="button button-secondary">Open</Link>
              <Link to={`/admin/events/${event.id}/edit`} className="button button-secondary">Edit</Link>
              <Link to={`/admin/events/${event.id}/bookings`} className="button button-secondary">Bookings</Link>
              <button type="button" className="button button-ghost" onClick={() => void runAction(event.id, 'publish')}>Publish</button>
              <button type="button" className="button button-ghost" onClick={() => void runAction(event.id, 'unpublish')}>Unpublish</button>
              <button type="button" className="button button-ghost" onClick={() => void runAction(event.id, 'cancel')}>Cancel event</button>
              <button type="button" className="button button-danger" onClick={() => void runAction(event.id, 'delete')}>Delete</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
