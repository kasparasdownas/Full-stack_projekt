import { useMutation } from '@tanstack/react-query';
import { createBooking } from '../../api/client';
import type { BookingCreateRequest } from '../../api/types';

export function useCreateBookingMutation() {
  return useMutation({
    mutationFn: (payload: BookingCreateRequest) => createBooking(payload),
  });
}
