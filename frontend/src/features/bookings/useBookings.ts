import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cancelBooking, createBatchBooking, createBooking, getAdminEmailOutbox, getAdminEventBookings, getAdminEventWaitlist, getMyBookings, getMyWaitlist, joinWaitlist, leaveWaitlist } from '../../api/client';
import type { BookingBatchCreateRequest, BookingCreateRequest } from '../../api/types';

export const bookingHistoryQueryKey = ['bookings', 'me'] as const;
export const waitlistQueryKey = ['waitlist', 'me'] as const;

export function adminEventBookingsQueryKey(eventId: string) {
  return ['admin', 'events', eventId, 'bookings'] as const;
}

export function adminEventWaitlistQueryKey(eventId: string) {
  return ['admin', 'events', eventId, 'waitlist'] as const;
}

export function useCreateBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BookingCreateRequest) => createBooking(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bookingHistoryQueryKey });
    },
  });
}

export function useCreateBatchBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BookingBatchCreateRequest) => createBatchBooking(payload),
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

export function useMyBookingsQuery() {
  return useQuery({
    queryKey: bookingHistoryQueryKey,
    queryFn: getMyBookings,
  });
}

export function useAdminEventBookingsQuery(eventId: string) {
  return useQuery({
    queryKey: adminEventBookingsQueryKey(eventId),
    queryFn: () => getAdminEventBookings(eventId),
    enabled: Boolean(eventId),
  });
}

export function useMyWaitlistQuery() {
  return useQuery({
    queryKey: waitlistQueryKey,
    queryFn: getMyWaitlist,
  });
}

export function useAdminEventWaitlistQuery(eventId: string) {
  return useQuery({
    queryKey: adminEventWaitlistQueryKey(eventId),
    queryFn: () => getAdminEventWaitlist(eventId),
    enabled: Boolean(eventId),
  });
}

export function useAdminEmailOutboxQuery() {
  return useQuery({
    queryKey: ['admin', 'email-outbox'],
    queryFn: getAdminEmailOutbox,
  });
}

export function useCancelBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId }: { bookingId: string; eventId: string }) => cancelBooking(bookingId),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: bookingHistoryQueryKey }),
        queryClient.invalidateQueries({ queryKey: waitlistQueryKey }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'email-outbox'] }),
        queryClient.invalidateQueries({ queryKey: ['events'] }),
        queryClient.invalidateQueries({ queryKey: ['events', variables.eventId] }),
        queryClient.invalidateQueries({ queryKey: ['events', variables.eventId, 'seats'] }),
      ]);
    },
  });
}

export function useWaitlistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, action }: { eventId: string; action: 'join' | 'leave' }) => (
      action === 'join' ? joinWaitlist(eventId) : leaveWaitlist(eventId)
    ),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: waitlistQueryKey }),
        queryClient.invalidateQueries({ queryKey: ['events', variables.eventId] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'events', variables.eventId, 'waitlist'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'email-outbox'] }),
      ]);
    },
  });
}
