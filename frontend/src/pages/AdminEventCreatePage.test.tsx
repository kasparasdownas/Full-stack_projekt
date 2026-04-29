import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../api/client';
import { AdminEventCreatePage } from './AdminEventCreatePage';

const mutateAsyncMock = vi.fn();
let createEventError: ApiError | null = null;

vi.mock('../features/events/useEvents', () => ({
  useCreateEventMutation: () => ({
    mutateAsync: mutateAsyncMock,
    isPending: false,
    error: createEventError,
  }),
}));

describe('AdminEventCreatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createEventError = null;
  });

  it('submits the expected payload and navigates to the created event', async () => {
    mutateAsyncMock.mockResolvedValue({
      id: 'event-123',
      title: 'New Admin Event',
      description: 'Created through admin UI.',
      dateTime: '2026-06-01T17:30:00.000Z',
      venue: 'Building 101',
      seatsTotal: 14,
      seatsAvailable: 14,
      status: 'PUBLISHED',
    });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/admin/events/new']}>
          <Routes>
            <Route path="/admin/events/new" element={<AdminEventCreatePage />} />
            <Route path="/events/:eventId" element={<h1>Event detail</h1>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Admin Event' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Created through admin UI.' } });
    fireEvent.change(screen.getByLabelText('Date and time'), { target: { value: '2026-06-01T19:30' } });
    fireEvent.change(screen.getByLabelText('Venue'), { target: { value: 'Building 101' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /Seat capacity/i }), { target: { value: '14' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create event' }));

    await waitFor(() =>
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        title: 'New Admin Event',
        description: 'Created through admin UI.',
        dateTime: new Date('2026-06-01T19:30').toISOString(),
        venue: 'Building 101',
        seatCapacity: 14,
        status: 'PUBLISHED',
      }),
    );

    expect(await screen.findByRole('heading', { name: 'Event detail' })).toBeInTheDocument();
  });

  it('shows inline API errors when creation fails', async () => {
    createEventError = new ApiError(400, 'VALIDATION_ERROR', 'Request validation failed', []);

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminEventCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Request validation failed');
  });
});
