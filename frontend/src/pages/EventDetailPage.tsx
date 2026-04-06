import { Link, useParams } from 'react-router-dom';
import { useEventQuery, useEventSeatsQuery } from '../features/events/useEvents';

export function EventDetailPage() {
  const { eventId = '' } = useParams();
  const eventQuery = useEventQuery(eventId);
  const seatsQuery = useEventSeatsQuery(eventId);

  if (!eventId) {
    return <div className="panel error-panel">Missing event identifier.</div>;
  }

  if (eventQuery.isLoading || seatsQuery.isLoading) {
    return <div className="panel">Loading event detail...</div>;
  }

  if (eventQuery.isError || seatsQuery.isError || !eventQuery.data || !seatsQuery.data) {
    return <div className="panel error-panel">Unable to load this event right now.</div>;
  }

  return (
    <section className="stack">
      <Link to="/events" className="text-link">
        ← Back to events
      </Link>

      <div className="panel detail-hero">
        <div>
          <p className="eyebrow">Event detail</p>
          <h1>{eventQuery.data.title}</h1>
          <p className="detail-meta">
            {new Date(eventQuery.data.dateTime).toLocaleString()} · {eventQuery.data.venue}
          </p>
          <p className="hero-text">{eventQuery.data.description}</p>
        </div>

        <div className="detail-stats">
          <div className="stat-card">
            <span className="stat-label">Total seats</span>
            <strong>{eventQuery.data.seatsTotal}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Available now</span>
            <strong>{eventQuery.data.seatsAvailable}</strong>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <h2>Seat availability</h2>
        </div>

        <div className="seat-grid">
          {seatsQuery.data.map((seat) => (
            <div key={seat.seatId} className={`seat-card ${seat.available ? 'seat-available' : 'seat-booked'}`}>
              <span>{seat.seatNumber}</span>
              <strong>{seat.available ? 'Available' : 'Booked'}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

