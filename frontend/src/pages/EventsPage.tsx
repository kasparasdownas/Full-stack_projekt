import { Link } from 'react-router-dom';
import { useEventsQuery } from '../features/events/useEvents';

export function EventsPage() {
  const eventsQuery = useEventsQuery();

  if (eventsQuery.isLoading) {
    return <div className="panel">Loading events...</div>;
  }

  if (eventsQuery.isError) {
    return <div className="panel error-panel">Unable to load events right now.</div>;
  }

  if (!eventsQuery.data?.length) {
    return <div className="panel">No events are available yet.</div>;
  }

  return (
    <section className="stack">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Event catalogue</p>
          <h1>Available events</h1>
        </div>
      </div>

      <div className="card-grid">
        {eventsQuery.data.map((event) => (
          <article key={event.id} className="panel event-card">
            <div className="event-card-header">
              <div>
                <h2>{event.title}</h2>
                <p className="muted">{event.venue}</p>
              </div>
              <span className="availability-pill">{event.availableSeatCount} seats free</span>
            </div>

            <p className="muted">{new Date(event.dateTime).toLocaleString()}</p>

            <Link className="button button-secondary" to={`/events/${event.id}`}>
              View event
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

