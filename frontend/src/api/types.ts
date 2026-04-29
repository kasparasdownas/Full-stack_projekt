export type UserRole = 'USER' | 'ADMIN';
export type EventStatus = 'UNPUBLISHED' | 'PUBLISHED' | 'CANCELED';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface EventSummary {
  id: string;
  title: string;
  dateTime: string;
  venue: string;
  availableSeatCount: number;
  status: EventStatus;
}

export interface EventDetail {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  venue: string;
  seatsTotal: number;
  seatsAvailable: number;
  status: EventStatus;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  dateTime: string;
  venue: string;
  seatCapacity: number;
  status?: EventStatus;
}

export interface UpdateEventRequest {
  title: string;
  description: string;
  dateTime: string;
  venue: string;
  status: EventStatus;
  seatCapacity: number;
}

export interface AdminEventSummary {
  id: string;
  title: string;
  dateTime: string;
  venue: string;
  status: EventStatus;
  seatsTotal: number;
  seatsAvailable: number;
  bookingCount: number;
}

export interface SeatAvailability {
  seatId: string;
  seatNumber: string;
  available: boolean;
}

export interface BookingCreateRequest {
  eventId: string;
  seatId: string;
}

export interface BookingBatchCreateRequest {
  eventId: string;
  seatIds: string[];
}

export interface BookingResponse {
  id: string;
  eventId: string;
  seatId: string;
  seatNumber: string;
  bookedAt: string;
}

export interface BookingBatchResponse {
  bookings: BookingResponse[];
}

export interface MyBookingSummary {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDateTime: string;
  venue: string;
  seatNumber: string;
  bookedAt: string;
}

export interface AdminEventBookingSummary {
  bookingId: string;
  userId: string;
  userEmail: string;
  seatId: string;
  seatNumber: string;
  bookedAt: string;
}

export interface WaitlistEntrySummary {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDateTime: string;
  venue: string;
  createdAt: string;
  notifiedAt: string | null;
}

export interface AdminWaitlistEntry {
  id: string;
  userId: string;
  userEmail: string;
  createdAt: string;
  notifiedAt: string | null;
}

export interface EmailOutboxSummary {
  id: string;
  recipientEmail: string;
  subject: string;
  body: string;
  createdAt: string;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  code: string;
  message: string;
  fieldErrors?: FieldError[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
