import type {
  ErrorResponse,
  EventDetail,
  EventSummary,
  LoginRequest,
  RegisterRequest,
  SeatAvailability,
  UserProfile,
} from './types';

export class ApiError extends Error {
  status: number;
  code: string;
  fieldErrors: ErrorResponse['fieldErrors'];

  constructor(status: number, code: string, message: string, fieldErrors: ErrorResponse['fieldErrors']) {
    super(message);
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    let payload: ErrorResponse | undefined;

    try {
      payload = (await response.json()) as ErrorResponse;
    } catch {
      payload = undefined;
    }

    throw new ApiError(
      response.status,
      payload?.code ?? 'UNKNOWN_ERROR',
      payload?.message ?? 'Unexpected error',
      payload?.fieldErrors,
    );
  }

  return (await response.json()) as T;
}

export function getCurrentUser() {
  return request<UserProfile>('/api/auth/me');
}

export function registerUser(payload: RegisterRequest) {
  return request<UserProfile>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload: LoginRequest) {
  return request<UserProfile>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getEvents() {
  return request<EventSummary[]>('/api/events');
}

export function getEvent(eventId: string) {
  return request<EventDetail>(`/api/events/${eventId}`);
}

export function getEventSeats(eventId: string) {
  return request<SeatAvailability[]>(`/api/events/${eventId}/seats`);
}

