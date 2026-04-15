import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../api/client';
import { useCancelBookingMutation, useMyBookingsQuery } from '../features/bookings/useBookings';

export function MyBookingsPage() {
  const bookingsQuery = useMyBookingsQuery();
  const cancelBookingMutation = useCancelBookingMutation();
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  async function handleCancelBooking(bookingId: string, eventId: string) {
    setPendingBookingId(bookingId);
    setFeedback(null);

    try {
      await cancelBookingMutation.mutateAsync({ bookingId, eventId });
      setFeedback({ kind: 'success', message: 'Booking cancelled.' });
    } catch (error) {
      if (error instanceof ApiError) {
        setFeedback({ kind: 'error', message: error.message });
      } else {
        setFeedback({ kind: 'error', message: 'Unable to cancel this booking right now.' });
      }
    } finally {
      setPendingBookingId(null);
    }
  }

  return (
    <section className="stack">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Booking management</p>
          <h1>My bookings</h1>
          <p className="muted">View your active reservations and cancel them when plans change.</p>
        </div>
      </div>

      {feedback ? (
        <p className={feedback.kind === 'success' ? 'inline-success' : 'inline-error'} role={feedback.kind === 'success' ? 'status' : 'alert'}>
          {feedback.message}
        </p>
      ) : null}

      {bookingsQuery.isLoading ? <div className="panel">Loading bookings...</div> : null}

      {bookingsQuery.isError ? <div className="panel error-panel">Unable to load your bookings right now.</div> : null}

      {!bookingsQuery.isLoading && !bookingsQuery.isError && bookingsQuery.data?.length === 0 ? (
        <div className="panel stack">
          <h2>No bookings yet</h2>
          <p className="muted">You have no bookings yet.</p>
          <div>
            <Link className="button button-secondary" to="/events">
              Browse events
            </Link>
          </div>
        </div>
      ) : null}

      {!bookingsQuery.isLoading && !bookingsQuery.isError && bookingsQuery.data?.length ? (
        <div className="card-grid">
          {bookingsQuery.data.map((booking) => (
            <article key={booking.id} className="panel event-card booking-card">
              <div>
                <h2>{booking.eventTitle}</h2>
                <p className="detail-meta">
                  {new Date(booking.eventDateTime).toLocaleString()} · {booking.venue}
                </p>
              </div>

              <div className="booking-meta">
                <p className="muted">
                  <strong>Seat:</strong> {booking.seatNumber}
                </p>
                <p className="muted">
                  <strong>Booked at:</strong> {new Date(booking.bookedAt).toLocaleString()}
                </p>
              </div>

              <div className="booking-card-actions">
                <Link className="button button-ghost" to={`/events/${booking.eventId}`}>
                  View event
                </Link>
                <button
                  className="button button-secondary"
                  type="button"
                  disabled={pendingBookingId === booking.id}
                  onClick={() => void handleCancelBooking(booking.id, booking.eventId)}
                >
                  {pendingBookingId === booking.id ? 'Cancelling...' : 'Cancel booking'}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
