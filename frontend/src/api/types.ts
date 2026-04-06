export type UserRole = 'USER' | 'ADMIN';

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
}

export interface EventDetail {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  venue: string;
  seatsTotal: number;
  seatsAvailable: number;
}

export interface SeatAvailability {
  seatId: string;
  seatNumber: string;
  available: boolean;
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

