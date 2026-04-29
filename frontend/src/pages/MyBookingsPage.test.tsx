import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../api/client';
import { MyBookingsPage } from './MyBookingsPage';

const useMyBookingsQueryMock = vi.fn();
const mutateAsyncMock = vi.fn();
const useMyWaitlistQueryMock = vi.fn();
const waitlistMutateAsyncMock = vi.fn();

vi.mock('../features/bookings/useBookings', () => ({
  useMyBookingsQuery: () => useMyBookingsQueryMock(),
  useMyWaitlistQuery: () => useMyWaitlistQueryMock(),
  useCancelBookingMutation: () => ({
    mutateAsync: mutateAsyncMock,
  }),
  useWaitlistMutation: () => ({
    mutateAsync: waitlistMutateAsyncMock,
  }),
}));

describe('MyBookingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMyWaitlistQueryMock.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [],
    });
  });

  it('renders booking cards from the query response', () => {
    useMyBookingsQueryMock.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        {
          id: 'booking-1',
          eventId: 'event-1',
          eventTitle: 'Spring Concert',
          eventDateTime: '2026-05-18T19:30:00Z',
          venue: 'DTU Hall A',
          seatNumber: 'A01',
          bookedAt: '2026-05-01T18:00:00Z',
        },
      ],
    });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MyBookingsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByRole('heading', { name: 'Spring Concert' })).toBeInTheDocument();
    expect(screen.getByText(/Seat:/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View event' })).toHaveAttribute('href', '/events/event-1');
    expect(screen.getByRole('button', { name: 'Cancel booking' })).toBeInTheDocument();
  });

  it('renders the empty state when the user has no bookings', () => {
    useMyBookingsQueryMock.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [],
    });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MyBookingsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('You have no bookings yet.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse events' })).toHaveAttribute('href', '/events');
  });

  it('cancels the last booking, shows feedback, and transitions to the empty state', async () => {
    let bookings = [
      {
        id: 'booking-1',
        eventId: 'event-1',
        eventTitle: 'Spring Concert',
        eventDateTime: '2026-05-18T19:30:00Z',
        venue: 'DTU Hall A',
        seatNumber: 'A01',
        bookedAt: '2026-05-01T18:00:00Z',
      },
    ];

    useMyBookingsQueryMock.mockImplementation(() => ({
      isLoading: false,
      isError: false,
      data: bookings,
    }));

    mutateAsyncMock.mockImplementation(async ({ bookingId }: { bookingId: string }) => {
      bookings = bookings.filter((booking) => booking.id !== bookingId);
    });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MyBookingsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel booking' }));

    await waitFor(() => expect(mutateAsyncMock).toHaveBeenCalledWith({ bookingId: 'booking-1', eventId: 'event-1' }));
    expect(await screen.findByText('Booking cancelled.')).toBeInTheDocument();
    expect(await screen.findByText('You have no bookings yet.')).toBeInTheDocument();
  });

  it('shows an inline error when cancellation fails', async () => {
    useMyBookingsQueryMock.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        {
          id: 'booking-1',
          eventId: 'event-1',
          eventTitle: 'Spring Concert',
          eventDateTime: '2026-05-18T19:30:00Z',
          venue: 'DTU Hall A',
          seatNumber: 'A01',
          bookedAt: '2026-05-01T18:00:00Z',
        },
      ],
    });
    mutateAsyncMock.mockRejectedValue(new ApiError(404, 'BOOKING_NOT_FOUND', 'Booking not found', []));

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MyBookingsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel booking' }));

    expect(await screen.findByText('Booking not found')).toBeInTheDocument();
  });
});
