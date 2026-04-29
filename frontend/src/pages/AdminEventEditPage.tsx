import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../api/client';
import type { EventStatus } from '../api/types';
import { FormField } from '../components/FormField';
import { useEventQuery, useUpdateEventMutation } from '../features/events/useEvents';

export function AdminEventEditPage() {
  const { eventId = '' } = useParams();
  const navigate = useNavigate();
  const eventQuery = useEventQuery(eventId);
  const updateEventMutation = useUpdateEventMutation(eventId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [venue, setVenue] = useState('');
  const [status, setStatus] = useState<EventStatus>('PUBLISHED');
  const [seatCapacity, setSeatCapacity] = useState('24');

  useEffect(() => {
    if (!eventQuery.data) return;
    setTitle(eventQuery.data.title);
    setDescription(eventQuery.data.description);
    setDateTime(eventQuery.data.dateTime.slice(0, 16));
    setVenue(eventQuery.data.venue);
    setStatus(eventQuery.data.status);
    setSeatCapacity(String(eventQuery.data.seatsTotal));
  }, [eventQuery.data]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const updatedEvent = await updateEventMutation.mutateAsync({
      title,
      description,
      dateTime: new Date(dateTime).toISOString(),
      venue,
      status,
      seatCapacity: Number(seatCapacity),
    });
    navigate(`/events/${updatedEvent.id}`);
  }

  if (eventQuery.isLoading) {
    return <div className="panel">Loading event editor...</div>;
  }

  if (eventQuery.isError || !eventQuery.data) {
    return <div className="panel error-panel">Unable to load this event for editing.</div>;
  }

  return (
    <section className="auth-grid">
      <div className="panel">
        <Link to="/admin/events" className="text-link">← Back to admin events</Link>
        <p className="eyebrow">Admin tools</p>
        <h1>Edit event</h1>
        <p className="muted">Capacity can grow freely. Reducing capacity is blocked if it would remove booked seats.</p>
      </div>

      <form className="panel form-panel" onSubmit={submit}>
        <FormField label="Title" htmlFor="edit-event-title">
          <input id="edit-event-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} required />
        </FormField>
        <FormField label="Description" htmlFor="edit-event-description">
          <textarea id="edit-event-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={4} required />
        </FormField>
        <FormField label="Date and time" htmlFor="edit-event-date-time">
          <input id="edit-event-date-time" type="datetime-local" value={dateTime} onChange={(event) => setDateTime(event.target.value)} required />
        </FormField>
        <FormField label="Venue" htmlFor="edit-event-venue">
          <input id="edit-event-venue" value={venue} onChange={(event) => setVenue(event.target.value)} maxLength={160} required />
        </FormField>
        <FormField label="Status" htmlFor="edit-event-status">
          <select id="edit-event-status" value={status} onChange={(event) => setStatus(event.target.value as EventStatus)}>
            <option value="PUBLISHED">Published</option>
            <option value="UNPUBLISHED">Unpublished</option>
            <option value="CANCELED">Canceled</option>
          </select>
        </FormField>
        <FormField label="Seat capacity" htmlFor="edit-event-seat-capacity" hint="Minimum 1 seat, maximum 120 seats">
          <input id="edit-event-seat-capacity" type="number" min={1} max={120} value={seatCapacity} onChange={(event) => setSeatCapacity(event.target.value)} required />
        </FormField>
        {updateEventMutation.error instanceof ApiError ? (
          <div className="inline-error" role="alert">{updateEventMutation.error.message}</div>
        ) : null}
        <button className="button button-primary" disabled={updateEventMutation.isPending} type="submit">
          {updateEventMutation.isPending ? 'Saving event...' : 'Save event'}
        </button>
      </form>
    </section>
  );
}
