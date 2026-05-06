import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../api/client';
import { AdminEventsPage } from './AdminEventsPage';

const useAdminEventsQueryMock = vi.fn();
const mutateAsyncMock = vi.fn();

vi.mock('../features/events/useEvents', () => ({
  useAdminEventsQuery: () => useAdminEventsQueryMock(),
  useEventStatusMutation: () => ({
    mutateAsync: mutateAsyncMock,
  }),
}));

describe('AdminEventsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    useAdminEventsQueryMock.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        {
          id: 'event-1',
          title: 'Published Event',
          dateTime: '2026-05-18T19:30:00Z',
          venue: 'DTU Hall A',
          status: 'PUBLISHED',
          seatsTotal: 24,
          seatsAvailable: 20,
          bookingCount: 4,
        },
        {
          id: 'event-2',
          title: 'Draft Event',
          dateTime: '2026-06-18T19:30:00Z',
          venue: 'DTU Hall B',
          status: 'UNPUBLISHED',
          seatsTotal: 12,
          seatsAvailable: 12,
          bookingCount: 0,
        },
        {
          id: 'event-3',
          title: 'Canceled Event',
          dateTime: '2026-07-18T19:30:00Z',
          venue: 'DTU Hall C',
          status: 'CANCELED',
          seatsTotal: 12,
          seatsAvailable: 12,
          bookingCount: 0,
        },
      ],
    });
  });

  function renderPage() {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminEventsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  }

  it('filters admin events by status', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Unpublished' }));

    expect(screen.getByText('Draft Event')).toBeInTheDocument();
    expect(screen.queryByText('Published Event')).not.toBeInTheDocument();
    expect(screen.queryByText('Canceled Event')).not.toBeInTheDocument();
  });

  it('confirms destructive actions before cancelling or deleting events', async () => {
    mutateAsyncMock.mockResolvedValue(undefined);

    renderPage();

    fireEvent.click(screen.getAllByRole('button', { name: 'Cancel event' })[0]);

    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('Cancel "Published Event"?'));
    await waitFor(() => expect(mutateAsyncMock).toHaveBeenCalledWith({ eventId: 'event-1', action: 'cancel' }));
    expect(await screen.findByText('Event cancelled.')).toBeInTheDocument();
  });

  it('does not run destructive action when confirmation is rejected', () => {
    vi.mocked(window.confirm).mockReturnValue(false);

    renderPage();

    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0]);

    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it('shows backend errors from admin lifecycle actions', async () => {
    mutateAsyncMock.mockRejectedValue(new ApiError(409, 'EVENT_HAS_DEPENDENCIES', 'Event has bookings or waitlist entries and cannot be deleted', []));

    renderPage();

    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0]);

    expect(await screen.findByRole('alert')).toHaveTextContent('Event has bookings or waitlist entries and cannot be deleted');
  });

  it('disables only the clicked action while pending', async () => {
    mutateAsyncMock.mockReturnValue(new Promise(() => undefined));

    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Unpublish' }));

    expect(await screen.findByRole('button', { name: 'Working...' })).toBeDisabled();
    expect(screen.getAllByRole('button', { name: 'Delete' })[0]).not.toBeDisabled();
  });
});
