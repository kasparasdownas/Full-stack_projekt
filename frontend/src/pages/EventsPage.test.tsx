import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { EventsPage } from './EventsPage';

const useEventsQueryMock = vi.fn();

vi.mock('../features/events/useEvents', () => ({
  useEventsQuery: () => useEventsQueryMock(),
}));

describe('EventsPage', () => {
  it('renders event cards from the query response', () => {
    useEventsQueryMock.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        {
          id: 'event-1',
          title: 'Spring Concert',
          dateTime: '2026-05-18T19:30:00Z',
          venue: 'DTU Hall A',
          availableSeatCount: 24,
        },
      ],
    });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <EventsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByRole('heading', { name: 'Spring Concert' })).toBeInTheDocument();
    expect(screen.getByText('24 seats free')).toBeInTheDocument();
  });
});
