import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEventsQuery } from '../features/events/useEvents';

export function EventsPage() {
  const eventsQuery = useEventsQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  if (eventsQuery.isLoading) {
    return <div className="panel">Loading events...</div>;
  }

  if (eventsQuery.isError) {
    return <div className="panel error-panel">Unable to load events right now.</div>;
  }

  if (!eventsQuery.data?.length) {
    return <div className="panel">No events are available yet.</div>;
  }

  const filteredEvents = eventsQuery.data.filter((event) => {
    if (!normalizedSearchTerm) {
      return true;
    }

    return (
      event.title.toLowerCase().includes(normalizedSearchTerm) ||
      event.venue.toLowerCase().includes(normalizedSearchTerm)
    );
  });

  return (
    <section className="stack">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Event catalogue</p>
          <h1>Available events</h1>
          <p className="muted">Search by title or venue to narrow the list.</p>
        </div>
        <div className="event-search">
          <input
            aria-label="Search events"
            type="search"
            placeholder="Search events"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          {searchTerm ? (
            <button className="button button-secondary" type="button" onClick={() => setSearchTerm('')}>
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {!filteredEvents.length ? (
        <div className="panel">No events match your search.</div>
      ) : null}

      <div className="card-grid">
        {filteredEvents.map((event) => (
          <article key={event.id} className="panel event-card">
            <div className="event-card-header">
              <div>
                <h2>{event.title}</h2>
                <p className="muted">{event.venue}</p>
              </div>
              <span className="availability-pill">{event.availableSeatCount} seats free</span>
            </div>

            <p className="muted">{new Date(event.dateTime).toLocaleString()}</p>

            <div className="event-card-actions">
              <Link className="button button-secondary" to={`/events/${event.id}`}>
                View event
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
