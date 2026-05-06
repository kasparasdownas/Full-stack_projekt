import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminEmailOutboxPage } from './AdminEmailOutboxPage';

const useAdminEmailOutboxQueryMock = vi.fn();

vi.mock('../features/bookings/useBookings', () => ({
  useAdminEmailOutboxQuery: () => useAdminEmailOutboxQueryMock(),
}));

describe('AdminEmailOutboxPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderPage() {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <AdminEmailOutboxPage />
      </QueryClientProvider>,
    );
  }

  it('renders a helpful empty state', () => {
    useAdminEmailOutboxQueryMock.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [],
    });

    renderPage();

    expect(screen.getByText(/Booking confirmations, cancellation receipts, and waitlist notifications will appear here/i)).toBeInTheDocument();
  });

  it('renders email evidence in a styled data table', () => {
    useAdminEmailOutboxQueryMock.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        {
          id: 'email-1',
          recipientEmail: 'alice@example.com',
          subject: 'Booking confirmed',
          body: 'Your booking is confirmed.',
          createdAt: '2026-05-01T18:00:00Z',
        },
      ],
    });

    renderPage();

    expect(screen.getByRole('table')).toHaveClass('data-table');
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('Booking confirmed')).toBeInTheDocument();
  });
});
