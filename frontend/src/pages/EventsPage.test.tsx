import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { EventsPage } from './EventsPage';

const useEventsQueryMock = vi.fn();

vi.mock('../features/events/useEvents', () => ({
  useEventsQuery: () => useEventsQueryMock(),
}));

describe('EventsPage', () => {
  it('renders all event cards when the search field is empty', () => {
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
        {
          id: 'event-2',
          title: 'Distributed Systems Talk',
          dateTime: '2026-06-01T15:00:00Z',
          venue: 'Building 101',
          availableSeatCount: 42,
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
    expect(screen.getByRole('heading', { name: 'Distributed Systems Talk' })).toBeInTheDocument();
  });

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

  it('filters events by title and venue with case-insensitive matching', () => {
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
        {
          id: 'event-2',
          title: 'Distributed Systems Talk',
          dateTime: '2026-06-01T15:00:00Z',
          venue: 'Building 101',
          availableSeatCount: 42,
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

    fireEvent.change(screen.getByLabelText('Search events'), { target: { value: 'concert' } });
    expect(screen.getByRole('heading', { name: 'Spring Concert' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Distributed Systems Talk' })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Search events'), { target: { value: 'building 101' } });
    expect(screen.getByRole('heading', { name: 'Distributed Systems Talk' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Spring Concert' })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Search events'), { target: { value: '  dTu hall a  ' } });
    expect(screen.getByRole('heading', { name: 'Spring Concert' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Distributed Systems Talk' })).not.toBeInTheDocument();
  });

  it('shows a filtered empty state and clears back to the full list', () => {
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

    fireEvent.change(screen.getByLabelText('Search events'), { target: { value: 'no-match' } });

    expect(screen.getByText('No events match your search.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Spring Concert' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

    expect(screen.getByLabelText('Search events')).toHaveValue('');
    expect(screen.getByRole('heading', { name: 'Spring Concert' })).toBeInTheDocument();
  });

  it('treats whitespace-only input like an empty search', () => {
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

    fireEvent.change(screen.getByLabelText('Search events'), { target: { value: '   ' } });

    expect(screen.getByRole('heading', { name: 'Spring Concert' })).toBeInTheDocument();
    expect(screen.queryByText('No events match your search.')).not.toBeInTheDocument();
  });

  it('keeps the no-events state when the API returns no events', () => {
    useEventsQueryMock.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [],
    });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <EventsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('No events are available yet.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Search events')).not.toBeInTheDocument();
  });

  it('keeps the existing loading and error states', () => {
    useEventsQueryMock.mockReturnValueOnce({
      isLoading: true,
      isError: false,
      data: null,
    });

    let queryClient = new QueryClient();

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <EventsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('Loading events...')).toBeInTheDocument();

    useEventsQueryMock.mockReturnValueOnce({
      isLoading: false,
      isError: true,
      data: null,
    });

    queryClient = new QueryClient();

    rerender(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <EventsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('Unable to load events right now.')).toBeInTheDocument();
  });
});
