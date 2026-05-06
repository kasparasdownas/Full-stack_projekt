import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError } from '../api/client';
import { useCurrentUserQuery } from '../features/auth/useAuth';
import { useCreateBatchBookingMutation, useMyWaitlistQuery, useWaitlistMutation } from '../features/bookings/useBookings';
import { useEventQuery, useEventSeatsQuery } from '../features/events/useEvents';

export function EventDetailPage() {
  const { eventId = '' } = useParams();
  const queryClient = useQueryClient();
  const eventQuery = useEventQuery(eventId);
  const seatsQuery = useEventSeatsQuery(eventId);
  const currentUserQuery = useCurrentUserQuery();
  const bookingMutation = useCreateBatchBookingMutation();
  const waitlistMutation = useWaitlistMutation();
  const myWaitlistQuery = useMyWaitlistQuery();
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
  const isAuthenticated = Boolean(currentUserQuery.data);
  const alreadyWaitlisted = Boolean(myWaitlistQuery.data?.some((entry) => entry.eventId === eventId));
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

      <div className="panel event-detail-card">
        <div className="event-detail-main">
          <p className="eyebrow">Event detail</p>
          <h1 className="event-detail-title">{eventQuery.data.title}</h1>
          <div className="event-detail-badges">
            <span className={`status-pill status-${eventQuery.data.status.toLowerCase()}`}>{eventQuery.data.status}</span>
            {soldOut ? <span className="status-pill status-canceled">Sold out</span> : null}
          </div>
          <p className="detail-meta">
            {new Date(eventQuery.data.dateTime).toLocaleString()} · {eventQuery.data.venue}
          </p>
          <p className="hero-text">{eventQuery.data.description}</p>
        </div>

        <aside className="event-detail-sidebar" aria-label="Event summary">
          <div className="summary-stat">
            <span className="stat-label">Total seats</span>
            <strong>{eventQuery.data.seatsTotal}</strong>
          </div>
          <div className="summary-stat">
            <span className="stat-label">Available now</span>
            <strong>{eventQuery.data.seatsAvailable}</strong>
          </div>
          <div className={`summary-stat ${soldOut ? 'summary-stat-alert' : ''}`}>
            <span className="stat-label">Booking status</span>
            <strong>{soldOut ? 'Sold out' : 'Available'}</strong>
          </div>
          {currentUserQuery.data?.role === 'ADMIN' ? (
            <Link to={`/admin/events/${eventId}/bookings`} className="button button-secondary">
              View bookings
            </Link>
          ) : null}
        </aside>
      </div>

      <div className="panel seat-panel">
        <div className="seat-panel-header">
          <div>
            <p className="eyebrow">Seat map</p>
            <h2>Seat availability</h2>
          </div>
          <span className={`status-pill ${soldOut ? 'status-canceled' : 'status-published'}`}>
            {soldOut ? 'Sold out' : `${eventQuery.data.seatsAvailable} available`}
          </span>
        </div>

        <div className="notice-stack">
          {soldOut ? (
            <p className="notice notice-error" role="status">
              Sold out. No seats are currently available for this event.
            </p>
          ) : null}

          {bookingDisabledReason ? (
            <p className="notice notice-error" role="status">
              {bookingDisabledReason}
            </p>
          ) : null}

          {feedback ? (
            <p className={feedback.kind === 'success' ? 'notice notice-success' : 'notice notice-error'} role={feedback.kind === 'success' ? 'status' : 'alert'}>
              {feedback.message}
            </p>
          ) : null}
        </div>

        {!isAuthenticated ? (
          <div className="panel subtle-panel">
            <p className="muted">Log in to select seats, book tickets, or join the waitlist.</p>
            <Link className="button button-primary" to="/login">
              Log in to book seats
            </Link>
          </div>
        ) : null}

        <div className="seat-map-shell">
          <div className="cinema-screen">Screen / stage</div>

          <div className="seat-legend" aria-label="Seat map legend">
            <span><i className="legend-dot legend-available" /> Available</span>
            <span><i className="legend-dot legend-selected" /> Selected</span>
            <span><i className="legend-dot legend-booked" /> Booked</span>
          </div>

          <div className="cinema-map">
            {Object.entries(seatRows).map(([row, seats]) => (
              <div key={row} className="seat-row">
                <span className="row-label">{row}</span>
                <div className="seat-row-grid">
                  {seats.map((seat) => {
                    const selectable = isAuthenticated && seat.available && bookingOpen;
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
        </div>

        {isAuthenticated && bookingOpen && !soldOut ? (
          <div className="booking-summary booking-summary-sticky">
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
              disabled={selectedSeatIds.length === 0 || bookingMutation.isPending}
              onClick={() => void handleSeatBooking()}
            >
              {bookingMutation.isPending ? 'Booking seats...' : 'Book selected seats'}
            </button>
          </div>
        ) : null}

        {isAuthenticated && soldOut && bookingOpen ? (
          <div className="booking-summary booking-summary-sticky">
            <p>
              <strong>Sold out</strong>
              <span className="muted"> Join the waitlist to be notified if a seat opens.</span>
            </p>
            <button
              className="button button-secondary"
              type="button"
              disabled={waitlistMutation.isPending || alreadyWaitlisted}
              onClick={() => void handleJoinWaitlist()}
            >
              {alreadyWaitlisted ? 'Already on waitlist' : waitlistMutation.isPending ? 'Joining waitlist...' : 'Join waitlist'}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
