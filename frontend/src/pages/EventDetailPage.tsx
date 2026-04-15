import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError } from '../api/client';
import { useCreateBookingMutation } from '../features/bookings/useBookings';
import { useEventQuery, useEventSeatsQuery } from '../features/events/useEvents';

export function EventDetailPage() {
  const { eventId = '' } = useParams();
  const queryClient = useQueryClient();
  const eventQuery = useEventQuery(eventId);
  const seatsQuery = useEventSeatsQuery(eventId);
  const bookingMutation = useCreateBookingMutation();
  const [pendingSeatId, setPendingSeatId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  if (!eventId) {
    return <div className="panel error-panel">Missing event identifier.</div>;
  }

  if (eventQuery.isLoading || seatsQuery.isLoading) {
    return <div className="panel">Loading event detail...</div>;
  }

  if (eventQuery.isError || seatsQuery.isError || !eventQuery.data || !seatsQuery.data) {
    return <div className="panel error-panel">Unable to load this event right now.</div>;
  }

  const soldOut = eventQuery.data.seatsAvailable === 0;

  async function handleSeatBooking(seatId: string) {
    setPendingSeatId(seatId);
    setFeedback(null);

    try {
      const booking = await bookingMutation.mutateAsync({ eventId, seatId });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['events', eventId] }),
        queryClient.invalidateQueries({ queryKey: ['events', eventId, 'seats'] }),
      ]);
      setFeedback({ kind: 'success', message: `Booked seat ${booking.seatNumber}.` });
    } catch (error) {
      if (error instanceof ApiError && error.code === 'SEAT_ALREADY_BOOKED') {
        setFeedback({ kind: 'error', message: 'Seat already booked' });
      } else {
        setFeedback({ kind: 'error', message: 'Unable to book this seat right now.' });
      }
    } finally {
      setPendingSeatId(null);
    }
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
          {soldOut ? <span className="availability-pill availability-pill-alert">Sold out</span> : null}
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

        {soldOut ? (
          <p className="inline-error" role="status">
            Sold out. No seats are currently available for this event.
          </p>
        ) : null}

        {feedback ? (
          <p className={feedback.kind === 'success' ? 'inline-success' : 'inline-error'} role={feedback.kind === 'success' ? 'status' : 'alert'}>
            {feedback.message}
          </p>
        ) : null}

        <div className="seat-grid">
          {seatsQuery.data.map((seat) => {
            const seatAvailable = seat.available && !soldOut;

            return (
              <div key={seat.seatId} className={`seat-card ${seatAvailable ? 'seat-available' : 'seat-booked'}`}>
                <span>{seat.seatNumber}</span>
                <strong>{seatAvailable ? 'Available' : 'Booked'}</strong>
                {seatAvailable ? (
                  <button
                    className="button button-ghost seat-action"
                    type="button"
                    disabled={pendingSeatId === seat.seatId}
                    onClick={() => void handleSeatBooking(seat.seatId)}
                  >
                    {pendingSeatId === seat.seatId ? 'Booking...' : 'Book seat'}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
