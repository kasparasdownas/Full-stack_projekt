import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cancelBooking, createBooking } from '../../api/client';
import { bookingHistoryQueryKey, useCancelBookingMutation, useCreateBookingMutation } from './useBookings';

vi.mock('../../api/client', async () => {
  const actual = await vi.importActual<typeof import('../../api/client')>('../../api/client');

  return {
    ...actual,
    cancelBooking: vi.fn(),
    createBooking: vi.fn(),
  };
});

const cancelBookingMock = vi.mocked(cancelBooking);
const createBookingMock = vi.mocked(createBooking);

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useBookings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invalidates booking history after a successful booking creation', async () => {
    createBookingMock.mockResolvedValue({
      id: 'booking-1',
      eventId: 'event-1',
      seatId: 'seat-1',
      seatNumber: 'A01',
      bookedAt: '2026-05-01T18:00:00Z',
    });

    const queryClient = new QueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateBookingMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({ eventId: 'event-1', seatId: 'seat-1' });
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: bookingHistoryQueryKey });
  });

  it('invalidates booking and event queries after a successful cancellation', async () => {
    cancelBookingMock.mockResolvedValue(undefined);

    const queryClient = new QueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCancelBookingMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({ bookingId: 'booking-1', eventId: 'event-1' });
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: bookingHistoryQueryKey });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['events'] });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['events', 'event-1'] });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['events', 'event-1', 'seats'] });
  });
});
