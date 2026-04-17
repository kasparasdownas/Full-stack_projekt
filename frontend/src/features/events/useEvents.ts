import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createEvent, getEvent, getEventSeats, getEvents } from '../../api/client';
import type { CreateEventRequest } from '../../api/types';

export function useEventsQuery() {
  return useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
  });
}

export function useCreateEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEventRequest) => createEvent(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useEventQuery(eventId: string) {
  return useQuery({
    queryKey: ['events', eventId],
    queryFn: () => getEvent(eventId),
    enabled: Boolean(eventId),
  });
}

export function useEventSeatsQuery(eventId: string) {
  return useQuery({
    queryKey: ['events', eventId, 'seats'],
    queryFn: () => getEventSeats(eventId),
    enabled: Boolean(eventId),
  });
}
