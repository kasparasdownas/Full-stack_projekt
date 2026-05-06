import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../api/client';
import { EventDetailPage } from './EventDetailPage';

const useEventQueryMock = vi.fn();
const useEventSeatsQueryMock = vi.fn();
const mutateAsyncMock = vi.fn();
const waitlistMutateAsyncMock = vi.fn();
const useCurrentUserQueryMock = vi.fn();
const useMyWaitlistQueryMock = vi.fn();

vi.mock('../features/events/useEvents', () => ({
  useEventQuery: () => useEventQueryMock(),
  useEventSeatsQuery: () => useEventSeatsQueryMock(),
}));

vi.mock('../features/auth/useAuth', () => ({
  useCurrentUserQuery: () => useCurrentUserQueryMock(),
}));

vi.mock('../features/bookings/useBookings', () => ({
  useCreateBatchBookingMutation: () => ({
    mutateAsync: mutateAsyncMock,
    isPending: false,
  }),
  useMyWaitlistQuery: () => useMyWaitlistQueryMock(),
  useWaitlistMutation: () => ({
    mutateAsync: waitlistMutateAsyncMock,
    isPending: false,
  }),
}));

describe('EventDetailPage', () => {
  beforeEach(() => {
    mutateAsyncMock.mockReset();
    waitlistMutateAsyncMock.mockReset();
    useEventQueryMock.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        id: 'event-1',
        title: 'Spring Concert',
        description: 'Live student concert.',
        dateTime: '2026-05-18T19:30:00Z',
        venue: 'DTU Hall A',
        seatsTotal: 24,
        seatsAvailable: 23,
        status: 'PUBLISHED',
      },
    });
    useEventSeatsQueryMock.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        { seatId: 'seat-1', seatNumber: 'A01', available: true },
        { seatId: 'seat-2', seatNumber: 'A02', available: false },
      ],
    });
    useCurrentUserQueryMock.mockReturnValue({
      data: { id: 'user-1', name: 'Alice', email: 'alice@example.com', role: 'USER' },
    });
    useMyWaitlistQueryMock.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [],
    });
  });

  function renderPage(queryClient: QueryClient) {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/events/event-1']}>
          <Routes>
            <Route path="/events/:eventId" element={<EventDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
  }

  it('renders a booking action for available seats only', () => {
    const queryClient = new QueryClient();

    renderPage(queryClient);

    expect(screen.getByRole('button', { name: /A01/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Book selected seats' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /A02/i })).toHaveTextContent('Booked');
    expect(screen.queryByText('Sold out')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'View bookings' })).not.toBeInTheDocument();
  });

  it('shows an admin booking link for admins', () => {
    useCurrentUserQueryMock.mockReturnValue({
      data: { id: 'admin-1', name: 'Admin', email: 'admin@example.com', role: 'ADMIN' },
    });

    const queryClient = new QueryClient();

    renderPage(queryClient);

    expect(screen.getByRole('link', { name: 'View bookings' })).toHaveAttribute(
      'href',
      '/admin/events/event-1/bookings',
    );
  });

  it('shows explicit sold-out state when no seats are available', () => {
    useEventQueryMock.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        id: 'event-1',
        title: 'Spring Concert',
        description: 'Live student concert.',
        dateTime: '2026-05-18T19:30:00Z',
        venue: 'DTU Hall A',
        seatsTotal: 24,
        seatsAvailable: 0,
        status: 'PUBLISHED',
      },
    });
    useEventSeatsQueryMock.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        { seatId: 'seat-1', seatNumber: 'A01', available: false },
        { seatId: 'seat-2', seatNumber: 'A02', available: false },
      ],
    });

    const queryClient = new QueryClient();

    renderPage(queryClient);

    expect(screen.getAllByText('Sold out').length).toBeGreaterThan(0);
    expect(screen.getByText('Sold out. No seats are currently available for this event.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Book selected seats' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Join waitlist' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Booked/i })).toHaveLength(2);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('shows a login action when there is no authenticated user', () => {
    useCurrentUserQueryMock.mockReturnValue({ data: null });

    const queryClient = new QueryClient();

    renderPage(queryClient);

    expect(screen.getByRole('link', { name: 'Log in to book seats' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('button', { name: /A01/i })).toBeDisabled();
  });

  it('shows already-on-waitlist state for sold-out events', () => {
    useEventQueryMock.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        id: 'event-1',
        title: 'Spring Concert',
        description: 'Live student concert.',
        dateTime: '2026-05-18T19:30:00Z',
        venue: 'DTU Hall A',
        seatsTotal: 24,
        seatsAvailable: 0,
        status: 'PUBLISHED',
      },
    });
    useEventSeatsQueryMock.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        { seatId: 'seat-1', seatNumber: 'A01', available: false },
      ],
    });
    useMyWaitlistQueryMock.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        {
          id: 'waitlist-1',
          eventId: 'event-1',
          eventTitle: 'Spring Concert',
          eventDateTime: '2026-05-18T19:30:00Z',
          venue: 'DTU Hall A',
          createdAt: '2026-05-01T18:00:00Z',
          notifiedAt: null,
        },
      ],
    });

    const queryClient = new QueryClient();

    renderPage(queryClient);

    expect(screen.getByRole('button', { name: 'Already on waitlist' })).toBeDisabled();
  });

  it('submits a booking request and refreshes event queries after success', async () => {
    mutateAsyncMock.mockResolvedValue({
      bookings: [{
        id: 'booking-1',
        eventId: 'event-1',
        seatId: 'seat-1',
        seatNumber: 'A01',
        bookedAt: '2026-05-18T18:00:00Z',
      }],
    });

    const queryClient = new QueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderPage(queryClient);

    fireEvent.click(screen.getByRole('button', { name: /A01/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Book selected seats' }));

    await waitFor(() =>
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        eventId: 'event-1',
        seatIds: ['seat-1'],
      }),
    );

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['events', 'event-1'] });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['events', 'event-1', 'seats'] });
    });

    expect(await screen.findByText('Booked A01.')).toBeInTheDocument();
  });

  it('shows the backend conflict message when the seat is already booked', async () => {
    mutateAsyncMock.mockRejectedValue(new ApiError(409, 'SEAT_ALREADY_BOOKED', 'Seat already booked', []));

    const queryClient = new QueryClient();

    renderPage(queryClient);

    fireEvent.click(screen.getByRole('button', { name: /A01/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Book selected seats' }));

    expect(await screen.findByText('One or more selected seats are already booked.')).toBeInTheDocument();
  });
});
