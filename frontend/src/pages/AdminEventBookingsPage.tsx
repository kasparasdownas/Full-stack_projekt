import { Link, useParams } from 'react-router-dom';
import { useAdminEventBookingsQuery, useAdminEventWaitlistQuery } from '../features/bookings/useBookings';
import { useEventQuery } from '../features/events/useEvents';

export function AdminEventBookingsPage() {
  const { eventId = '' } = useParams();
  const eventQuery = useEventQuery(eventId);
  const bookingsQuery = useAdminEventBookingsQuery(eventId);
  const waitlistQuery = useAdminEventWaitlistQuery(eventId);

  if (!eventId) {
    return <div className="panel error-panel">Missing event identifier.</div>;
  }

  if (eventQuery.isLoading || bookingsQuery.isLoading || waitlistQuery.isLoading) {
    return <div className="panel">Loading event bookings...</div>;
  }

  if (eventQuery.isError || bookingsQuery.isError || waitlistQuery.isError || !eventQuery.data || !bookingsQuery.data || !waitlistQuery.data) {
    return <div className="panel error-panel">Unable to load event bookings right now.</div>;
  }

  return (
    <section className="stack">
      <Link to={`/events/${eventId}`} className="text-link">
        Back to event
      </Link>

      <div className="panel detail-hero">
        <div>
          <p className="eyebrow">Admin bookings</p>
          <h1>{eventQuery.data.title}</h1>
          <span className={`status-pill status-${eventQuery.data.status.toLowerCase()}`}>{eventQuery.data.status}</span>
          <p className="detail-meta">
            {new Date(eventQuery.data.dateTime).toLocaleString()} · {eventQuery.data.venue}
          </p>
        </div>

        <div className="detail-stats">
          <div className="stat-card">
            <span className="stat-label">Bookings</span>
            <strong>{bookingsQuery.data.length}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total seats</span>
            <strong>{eventQuery.data.seatsTotal}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Waitlist</span>
            <strong>{waitlistQuery.data.length}</strong>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <h2>Booked seats</h2>
        </div>

        {bookingsQuery.data.length === 0 ? (
          <p className="muted">No bookings have been made for this event yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Seat</th>
                  <th>User</th>
                  <th>Booked at</th>
                </tr>
              </thead>
              <tbody>
                {bookingsQuery.data.map((booking) => (
                  <tr key={booking.bookingId}>
                    <td>{booking.seatNumber}</td>
                    <td>{booking.userEmail}</td>
                    <td>{new Date(booking.bookedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="panel">
        <div className="section-heading">
          <h2>Waitlist</h2>
        </div>

        {waitlistQuery.data.length === 0 ? (
          <p className="muted">No users are waiting for this event.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Joined</th>
                  <th>Notified</th>
                </tr>
              </thead>
              <tbody>
                {waitlistQuery.data.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.userEmail}</td>
                    <td>{new Date(entry.createdAt).toLocaleString()}</td>
                    <td>{entry.notifiedAt ? new Date(entry.notifiedAt).toLocaleString() : 'Not yet'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
