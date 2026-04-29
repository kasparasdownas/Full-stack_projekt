import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cancelEvent, createEvent, deleteEvent, getAdminEvents, getEvent, getEventSeats, getEvents, publishEvent, unpublishEvent, updateEvent } from '../../api/client';
import type { CreateEventRequest, EventDetail, UpdateEventRequest } from '../../api/types';

export function useEventsQuery() {
  return useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
  });
}

export function useAdminEventsQuery() {
  return useQuery({
    queryKey: ['admin', 'events'],
    queryFn: getAdminEvents,
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

export function useUpdateEventMutation(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateEventRequest) => updateEvent(eventId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['events'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'events'] }),
        queryClient.invalidateQueries({ queryKey: ['events', eventId] }),
        queryClient.invalidateQueries({ queryKey: ['events', eventId, 'seats'] }),
      ]);
    },
  });
}

export function useEventStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation<EventDetail | void, Error, { eventId: string; action: 'publish' | 'unpublish' | 'cancel' | 'delete' }>({
    mutationFn: ({ eventId, action }: { eventId: string; action: 'publish' | 'unpublish' | 'cancel' | 'delete' }) => {
      if (action === 'publish') return publishEvent(eventId);
      if (action === 'unpublish') return unpublishEvent(eventId);
      if (action === 'cancel') return cancelEvent(eventId);
      return deleteEvent(eventId);
    },
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['events'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'events'] }),
        queryClient.invalidateQueries({ queryKey: ['events', variables.eventId] }),
        queryClient.invalidateQueries({ queryKey: ['events', variables.eventId, 'seats'] }),
      ]);
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
