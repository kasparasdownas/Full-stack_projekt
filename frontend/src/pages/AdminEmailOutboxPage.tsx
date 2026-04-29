import { useAdminEmailOutboxQuery } from '../features/bookings/useBookings';

export function AdminEmailOutboxPage() {
  const emailQuery = useAdminEmailOutboxQuery();

  if (emailQuery.isLoading) {
    return <div className="panel">Loading mock email outbox...</div>;
  }

  if (emailQuery.isError || !emailQuery.data) {
    return <div className="panel error-panel">Unable to load mock email outbox.</div>;
  }

  return (
    <section className="stack">
      <div className="panel">
        <p className="eyebrow">Admin evidence</p>
        <h1>Mock email outbox</h1>
        <p className="muted">Booking, cancellation, and waitlist notification emails are stored here as demo evidence.</p>
      </div>
      <div className="panel">
        {emailQuery.data.length === 0 ? (
          <p className="muted">No mock emails have been created yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Created</th>
                  <th>Recipient</th>
                  <th>Subject</th>
                  <th>Body</th>
                </tr>
              </thead>
              <tbody>
                {emailQuery.data.map((email) => (
                  <tr key={email.id}>
                    <td>{new Date(email.createdAt).toLocaleString()}</td>
                    <td>{email.recipientEmail}</td>
                    <td>{email.subject}</td>
                    <td>{email.body}</td>
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
