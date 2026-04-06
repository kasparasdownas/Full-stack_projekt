import { useQuery } from '@tanstack/react-query';
import { getEvent, getEventSeats, getEvents } from '../../api/client';

export function useEventsQuery() {
  return useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
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

