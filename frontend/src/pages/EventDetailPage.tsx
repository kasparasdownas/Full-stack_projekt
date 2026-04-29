import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError } from '../api/client';
import { useCurrentUserQuery } from '../features/auth/useAuth';
import { useCreateBatchBookingMutation, useWaitlistMutation } from '../features/bookings/useBookings';
import { useEventQuery, useEventSeatsQuery } from '../features/events/useEvents';

export function EventDetailPage() {
  const { eventId = '' } = useParams();
  const queryClient = useQueryClient();
  const eventQuery = useEventQuery(eventId);
  const seatsQuery = useEventSeatsQuery(eventId);
  const currentUserQuery = useCurrentUserQuery();
  const bookingMutation = useCreateBatchBookingMutation();
  const waitlistMutation = useWaitlistMutation();
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
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
  const eventIsPast = new Date(eventQuery.data.dateTime).getTime() <= Date.now();
  const bookingOpen = eventQuery.data.status === 'PUBLISHED' && !eventIsPast;
  const bookingDisabledReason = eventQuery.data.status === 'CANCELED'
    ? 'This event is canceled.'
    : eventQuery.data.status === 'UNPUBLISHED'
      ? 'This event is currently unpublished.'
      : eventIsPast
        ? 'This event has already happened.'
        : null;
  const seatRows = seatsQuery.data.reduce<Record<string, typeof seatsQuery.data>>((rows, seat) => {
    const row = seat.seatNumber.match(/^[A-Z]+/)?.[0] ?? 'Other';
    rows[row] = rows[row] ?? [];
    rows[row].push(seat);
    return rows;
  }, {});

  function toggleSeat(seatId: string) {
    setFeedback(null);
    setSelectedSeatIds((current) => (
      current.includes(seatId)
        ? current.filter((selectedSeatId) => selectedSeatId !== seatId)
        : [...current, seatId]
    ));
  }

  async function handleSeatBooking() {
    if (selectedSeatIds.length === 0) return;
    setFeedback(null);

    try {
      const response = await bookingMutation.mutateAsync({ eventId, seatIds: selectedSeatIds });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['events', eventId] }),
        queryClient.invalidateQueries({ queryKey: ['events', eventId, 'seats'] }),
      ]);
      setFeedback({ kind: 'success', message: `Booked ${response.bookings.map((booking) => booking.seatNumber).join(', ')}.` });
      setSelectedSeatIds([]);
    } catch (error) {
      if (error instanceof ApiError && error.code === 'SEAT_ALREADY_BOOKED') {
        setFeedback({ kind: 'error', message: 'One or more selected seats are already booked.' });
      } else {
        setFeedback({ kind: 'error', message: 'Unable to book these seats right now.' });
      }
    }
  }

  async function handleJoinWaitlist() {
    setFeedback(null);
    try {
      await waitlistMutation.mutateAsync({ eventId, action: 'join' });
      setFeedback({ kind: 'success', message: 'You joined the waitlist. A mock notification email was recorded.' });
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: error instanceof ApiError ? error.message : 'Unable to join the waitlist right now.',
      });
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
          <span className={`status-pill status-${eventQuery.data.status.toLowerCase()}`}>{eventQuery.data.status}</span>
          {soldOut ? <span className="availability-pill availability-pill-alert">Sold out</span> : null}
          <p className="detail-meta">
            {new Date(eventQuery.data.dateTime).toLocaleString()} · {eventQuery.data.venue}
          </p>
          <p className="hero-text">{eventQuery.data.description}</p>
          {currentUserQuery.data?.role === 'ADMIN' ? (
            <Link to={`/admin/events/${eventId}/bookings`} className="button button-secondary">
              View bookings
            </Link>
          ) : null}
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

        {bookingDisabledReason ? (
          <p className="inline-error" role="status">
            {bookingDisabledReason}
          </p>
        ) : null}

        {feedback ? (
          <p className={feedback.kind === 'success' ? 'inline-success' : 'inline-error'} role={feedback.kind === 'success' ? 'status' : 'alert'}>
            {feedback.message}
          </p>
        ) : null}

        <div className="cinema-screen">Screen / stage</div>

        <div className="cinema-map">
          {Object.entries(seatRows).map(([row, seats]) => (
            <div key={row} className="seat-row">
              <span className="row-label">{row}</span>
              <div className="seat-row-grid">
                {seats.map((seat) => {
                  const selectable = seat.available && bookingOpen;
                  const selected = selectedSeatIds.includes(seat.seatId);

                  return (
                    <button
                      key={seat.seatId}
                      className={`cinema-seat ${seat.available ? 'seat-available' : 'seat-booked'} ${selected ? 'seat-selected' : ''}`}
                      type="button"
                      disabled={!selectable || bookingMutation.isPending}
                      aria-pressed={selected}
                      onClick={() => toggleSeat(seat.seatId)}
                    >
                      <span>{seat.seatNumber}</span>
                      <strong>{seat.available ? (selected ? 'Selected' : 'Free') : 'Booked'}</strong>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="booking-summary">
          <p>
            Selected seats:{' '}
            <strong>
              {selectedSeatIds.length === 0
                ? 'None'
                : seatsQuery.data.filter((seat) => selectedSeatIds.includes(seat.seatId)).map((seat) => seat.seatNumber).join(', ')}
            </strong>
          </p>
          <button
            className="button button-primary"
            type="button"
            disabled={!bookingOpen || selectedSeatIds.length === 0 || bookingMutation.isPending}
            onClick={() => void handleSeatBooking()}
          >
            {bookingMutation.isPending ? 'Booking seats...' : 'Book selected seats'}
          </button>
          {soldOut && bookingOpen ? (
            <button
              className="button button-secondary"
              type="button"
              disabled={waitlistMutation.isPending}
              onClick={() => void handleJoinWaitlist()}
            >
              {waitlistMutation.isPending ? 'Joining waitlist...' : 'Join waitlist'}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
