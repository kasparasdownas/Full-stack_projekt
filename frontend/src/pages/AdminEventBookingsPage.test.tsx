import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminEventBookingsPage } from './AdminEventBookingsPage';

const useEventQueryMock = vi.fn();
const useAdminEventBookingsQueryMock = vi.fn();
const useAdminEventWaitlistQueryMock = vi.fn();

vi.mock('../features/events/useEvents', () => ({
  useEventQuery: () => useEventQueryMock(),
}));

vi.mock('../features/bookings/useBookings', () => ({
  useAdminEventBookingsQuery: () => useAdminEventBookingsQueryMock(),
  useAdminEventWaitlistQuery: () => useAdminEventWaitlistQueryMock(),
}));

describe('AdminEventBookingsPage', () => {
  beforeEach(() => {
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
    useAdminEventBookingsQueryMock.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        {
          bookingId: 'booking-1',
          userId: 'user-1',
          userEmail: 'alice@example.com',
          seatId: 'seat-1',
          seatNumber: 'A01',
          bookedAt: '2026-05-01T18:00:00Z',
        },
      ],
    });
    useAdminEventWaitlistQueryMock.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [],
    });
  });

  function renderPage() {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/admin/events/event-1/bookings']}>
          <Routes>
            <Route path="/admin/events/:eventId/bookings" element={<AdminEventBookingsPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
  }

  it('renders event details and booking rows', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Spring Concert' })).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('A01')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to event' })).toHaveAttribute('href', '/events/event-1');
  });

  it('renders an empty state when no bookings exist', () => {
    useAdminEventBookingsQueryMock.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [],
    });

    renderPage();

    expect(screen.getByText('No bookings have been made for this event yet.')).toBeInTheDocument();
  });
});
