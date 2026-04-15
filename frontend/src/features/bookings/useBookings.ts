import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cancelBooking, createBooking, getMyBookings } from '../../api/client';
import type { BookingCreateRequest } from '../../api/types';

export const bookingHistoryQueryKey = ['bookings', 'me'] as const;

export function useCreateBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BookingCreateRequest) => createBooking(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bookingHistoryQueryKey });
    },
  });
}

export function useMyBookingsQuery() {
  return useQuery({
    queryKey: bookingHistoryQueryKey,
    queryFn: getMyBookings,
  });
}

export function useCancelBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId }: { bookingId: string; eventId: string }) => cancelBooking(bookingId),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: bookingHistoryQueryKey }),
        queryClient.invalidateQueries({ queryKey: ['events'] }),
        queryClient.invalidateQueries({ queryKey: ['events', variables.eventId] }),
        queryClient.invalidateQueries({ queryKey: ['events', variables.eventId, 'seats'] }),
      ]);
    },
  });
}
