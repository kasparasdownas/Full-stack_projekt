import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../api/client';
import { EventDetailPage } from './EventDetailPage';

const useEventQueryMock = vi.fn();
const useEventSeatsQueryMock = vi.fn();
const mutateAsyncMock = vi.fn();

vi.mock('../features/events/useEvents', () => ({
  useEventQuery: () => useEventQueryMock(),
  useEventSeatsQuery: () => useEventSeatsQueryMock(),
}));

vi.mock('../features/bookings/useBookings', () => ({
  useCreateBookingMutation: () => ({
    mutateAsync: mutateAsyncMock,
  }),
}));

describe('EventDetailPage', () => {
  beforeEach(() => {
    mutateAsyncMock.mockReset();
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

    expect(screen.getByRole('button', { name: 'Book seat' })).toBeInTheDocument();
    expect(screen.getByText('Booked')).toBeInTheDocument();
  });

  it('submits a booking request and refreshes event queries after success', async () => {
    mutateAsyncMock.mockResolvedValue({
      id: 'booking-1',
      eventId: 'event-1',
      seatId: 'seat-1',
      seatNumber: 'A01',
      bookedAt: '2026-05-18T18:00:00Z',
    });

    const queryClient = new QueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderPage(queryClient);

    fireEvent.click(screen.getByRole('button', { name: 'Book seat' }));

    await waitFor(() =>
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        eventId: 'event-1',
        seatId: 'seat-1',
      }),
    );

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['events', 'event-1'] });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['events', 'event-1', 'seats'] });
    });

    expect(await screen.findByText('Booked seat A01.')).toBeInTheDocument();
  });

  it('shows the backend conflict message when the seat is already booked', async () => {
    mutateAsyncMock.mockRejectedValue(new ApiError(409, 'SEAT_ALREADY_BOOKED', 'Seat already booked', []));

    const queryClient = new QueryClient();

    renderPage(queryClient);

    fireEvent.click(screen.getByRole('button', { name: 'Book seat' }));

    expect(await screen.findByText('Seat already booked')).toBeInTheDocument();
  });
});
