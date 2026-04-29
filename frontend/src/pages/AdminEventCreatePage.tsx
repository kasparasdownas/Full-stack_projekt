import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import type { EventStatus } from '../api/types';
import { FormField } from '../components/FormField';
import { useCreateEventMutation } from '../features/events/useEvents';

export function AdminEventCreatePage() {
  const navigate = useNavigate();
  const createEventMutation = useCreateEventMutation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [venue, setVenue] = useState('');
  const [seatCapacity, setSeatCapacity] = useState('24');
  const [status, setStatus] = useState<EventStatus>('PUBLISHED');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const createdEvent = await createEventMutation.mutateAsync({
      title,
      description,
      dateTime: new Date(dateTime).toISOString(),
      venue,
      seatCapacity: Number(seatCapacity),
      status,
    });

    navigate(`/events/${createdEvent.id}`);
  }

  return (
    <section className="auth-grid">
      <div className="panel">
        <p className="eyebrow">Admin tools</p>
        <h1>Create event</h1>
        <p className="muted">
          This creates a new event in the event service and automatically generates numbered seats from the capacity
          you provide.
        </p>
      </div>

      <form className="panel form-panel" onSubmit={submit}>
        <FormField label="Title" htmlFor="create-event-title">
          <input id="create-event-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} required />
        </FormField>

        <FormField label="Description" htmlFor="create-event-description">
          <textarea
            id="create-event-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            required
          />
        </FormField>

        <FormField label="Date and time" htmlFor="create-event-date-time">
          <input
            id="create-event-date-time"
            type="datetime-local"
            value={dateTime}
            onChange={(event) => setDateTime(event.target.value)}
            required
          />
        </FormField>

        <FormField label="Venue" htmlFor="create-event-venue">
          <input id="create-event-venue" value={venue} onChange={(event) => setVenue(event.target.value)} maxLength={160} required />
        </FormField>

        <FormField label="Seat capacity" htmlFor="create-event-seat-capacity" hint="Minimum 1 seat, maximum 120 seats">
          <input
            id="create-event-seat-capacity"
            type="number"
            min={1}
            max={120}
            value={seatCapacity}
            onChange={(event) => setSeatCapacity(event.target.value)}
            required
          />
        </FormField>

        <FormField label="Initial status" htmlFor="create-event-status">
          <select id="create-event-status" value={status} onChange={(event) => setStatus(event.target.value as EventStatus)}>
            <option value="PUBLISHED">Published</option>
            <option value="UNPUBLISHED">Unpublished</option>
            <option value="CANCELED">Canceled</option>
          </select>
        </FormField>

        {createEventMutation.error instanceof ApiError ? (
          <div className="inline-error" role="alert">
            {createEventMutation.error.message}
          </div>
        ) : null}

        <button className="button button-primary" disabled={createEventMutation.isPending} type="submit">
          {createEventMutation.isPending ? 'Creating event...' : 'Create event'}
        </button>
      </form>
    </section>
  );
}
