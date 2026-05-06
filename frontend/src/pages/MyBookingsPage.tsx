import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../api/client';
import { useCancelBookingMutation, useMyBookingsQuery, useMyWaitlistQuery, useWaitlistMutation } from '../features/bookings/useBookings';

export function MyBookingsPage() {
  const bookingsQuery = useMyBookingsQuery();
  const waitlistQuery = useMyWaitlistQuery();
  const cancelBookingMutation = useCancelBookingMutation();
  const waitlistMutation = useWaitlistMutation();
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);
  const [pendingWaitlistEventId, setPendingWaitlistEventId] = useState<string | null>(null);
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

  async function handleLeaveWaitlist(eventId: string) {
    setPendingWaitlistEventId(eventId);
    setFeedback(null);

    try {
      await waitlistMutation.mutateAsync({ eventId, action: 'leave' });
      setFeedback({ kind: 'success', message: 'Removed from waitlist.' });
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: error instanceof ApiError ? error.message : 'Unable to leave the waitlist right now.',
      });
    } finally {
      setPendingWaitlistEventId(null);
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
        <div className="panel stack section-panel">
          <div>
            <p className="eyebrow">Active reservations</p>
            <h2>Your seats</h2>
          </div>
          <div className="card-grid">
          {bookingsQuery.data.map((booking) => {
            const eventIsPast = new Date(booking.eventDateTime).getTime() <= Date.now();

            return (
              <article key={booking.id} className="panel event-card booking-card">
                <div>
                  <h2>{booking.eventTitle}</h2>
                  {eventIsPast ? <span className="status-pill status-canceled">Past event</span> : null}
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
                    disabled={eventIsPast || pendingBookingId === booking.id}
                    onClick={() => void handleCancelBooking(booking.id, booking.eventId)}
                  >
                    {eventIsPast ? 'Past event' : pendingBookingId === booking.id ? 'Cancelling...' : 'Cancel booking'}
                  </button>
                </div>
                {eventIsPast ? <p className="field-hint">Past event bookings cannot be cancelled.</p> : null}
              </article>
            );
          })}
          </div>
        </div>
      ) : null}

      <div className="section-heading">
        <div>
          <p className="eyebrow">Waitlist</p>
          <h2>My waitlist</h2>
        </div>
      </div>

      {waitlistQuery.isLoading ? <div className="panel">Loading waitlist...</div> : null}
      {waitlistQuery.isError ? <div className="panel error-panel">Unable to load your waitlist right now.</div> : null}

      {!waitlistQuery.isLoading && !waitlistQuery.isError && waitlistQuery.data?.length === 0 ? (
        <div className="panel">
          <p className="muted">You are not waiting for any sold-out events.</p>
        </div>
      ) : null}

      {!waitlistQuery.isLoading && !waitlistQuery.isError && waitlistQuery.data?.length ? (
        <div className="panel stack section-panel">
          <div>
            <p className="eyebrow">Waiting list</p>
            <h2>Events you are waiting for</h2>
          </div>
          <div className="card-grid">
          {waitlistQuery.data.map((entry) => (
            <article key={entry.id} className="panel event-card booking-card">
              <h3>{entry.eventTitle}</h3>
              <p className="detail-meta">
                {new Date(entry.eventDateTime).toLocaleString()} · {entry.venue}
              </p>
              <p className="muted">Joined {new Date(entry.createdAt).toLocaleString()}</p>
              <p className="muted">Notification: {entry.notifiedAt ? new Date(entry.notifiedAt).toLocaleString() : 'Not yet'}</p>
              <div className="booking-card-actions">
                <Link className="button button-ghost" to={`/events/${entry.eventId}`}>View event</Link>
                <button
                  className="button button-secondary"
                  type="button"
                  disabled={pendingWaitlistEventId === entry.eventId}
                  onClick={() => void handleLeaveWaitlist(entry.eventId)}
                >
                  {pendingWaitlistEventId === entry.eventId ? 'Leaving...' : 'Leave waitlist'}
                </button>
              </div>
            </article>
          ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
