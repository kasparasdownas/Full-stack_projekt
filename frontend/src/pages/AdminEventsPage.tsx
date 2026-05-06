import { Link } from 'react-router-dom';
import { ApiError } from '../api/client';
import { useEventStatusMutation, useAdminEventsQuery } from '../features/events/useEvents';
import { useState } from 'react';
import type { EventStatus } from '../api/types';

type AdminFilter = 'ALL' | EventStatus;
type AdminAction = 'publish' | 'unpublish' | 'cancel' | 'delete';

export function AdminEventsPage() {
  const eventsQuery = useAdminEventsQuery();
  const statusMutation = useEventStatusMutation();
  const [filter, setFilter] = useState<AdminFilter>('ALL');
  const [pendingAction, setPendingAction] = useState<{ eventId: string; action: AdminAction } | null>(null);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  async function runAction(eventId: string, eventTitle: string, action: AdminAction) {
    if (action === 'cancel' && !window.confirm(`Cancel "${eventTitle}"? Users will no longer be able to book it.`)) {
      return;
    }
    if (action === 'delete' && !window.confirm(`Delete "${eventTitle}"? This only works when there are no bookings or waitlist entries.`)) {
      return;
    }

    setPendingAction({ eventId, action });
    setFeedback(null);

    try {
      await statusMutation.mutateAsync({ eventId, action });
      const labels: Record<AdminAction, string> = {
        publish: 'Event published.',
        unpublish: 'Event unpublished.',
        cancel: 'Event cancelled.',
        delete: 'Event deleted.',
      };
      setFeedback({ kind: 'success', message: labels[action] });
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: error instanceof ApiError ? error.message : 'Unable to update this event right now.',
      });
    } finally {
      setPendingAction(null);
    }
  }

  if (eventsQuery.isLoading) {
    return <div className="panel">Loading admin events...</div>;
  }

  if (eventsQuery.isError || !eventsQuery.data) {
    return <div className="panel error-panel">Unable to load admin events right now.</div>;
  }

  const filteredEvents = eventsQuery.data.filter((event) => filter === 'ALL' || event.status === filter);

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

      <div className="panel toolbar">
        <span className="muted">Filter by status</span>
        <div className="button-row">
          {(['ALL', 'PUBLISHED', 'UNPUBLISHED', 'CANCELED'] as const).map((option) => (
            <button
              key={option}
              type="button"
              className={`button ${filter === option ? 'button-primary' : 'button-secondary'} button-small`}
              onClick={() => setFilter(option)}
            >
              {option === 'ALL' ? 'All' : option.charAt(0) + option.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {feedback ? (
        <div className={feedback.kind === 'success' ? 'inline-success' : 'inline-error'} role={feedback.kind === 'success' ? 'status' : 'alert'}>
          {feedback.message}
        </div>
      ) : null}

      <div className="admin-event-grid">
        {filteredEvents.length === 0 ? (
          <div className="panel">
            <p className="muted">No events match this status filter.</p>
          </div>
        ) : null}
        {filteredEvents.map((event) => {
          const isPending = (action: AdminAction) => pendingAction?.eventId === event.id && pendingAction.action === action;
          const pendingLabel = (action: AdminAction, label: string) => (
            pendingAction?.eventId === event.id && pendingAction.action === action ? 'Working...' : label
          );

          return (
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
              {event.status === 'UNPUBLISHED' ? (
                <button type="button" className="button button-ghost" disabled={isPending('publish')} onClick={() => void runAction(event.id, event.title, 'publish')}>
                  {pendingLabel('publish', 'Publish')}
                </button>
              ) : null}
              {event.status === 'PUBLISHED' ? (
                <button type="button" className="button button-ghost" disabled={isPending('unpublish')} onClick={() => void runAction(event.id, event.title, 'unpublish')}>
                  {pendingLabel('unpublish', 'Unpublish')}
                </button>
              ) : null}
              {event.status !== 'CANCELED' ? (
                <button type="button" className="button button-ghost" disabled={isPending('cancel')} onClick={() => void runAction(event.id, event.title, 'cancel')}>
                  {pendingLabel('cancel', 'Cancel event')}
                </button>
              ) : null}
              <button type="button" className="button button-danger" disabled={isPending('delete')} onClick={() => void runAction(event.id, event.title, 'delete')}>
                {pendingLabel('delete', 'Delete')}
              </button>
            </div>
          </article>
          );
        })}
      </div>
    </section>
  );
}
