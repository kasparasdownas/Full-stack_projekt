import type {
  AdminEventBookingSummary,
  AdminEventSummary,
  AdminWaitlistEntry,
  BookingBatchCreateRequest,
  BookingBatchResponse,
  BookingCreateRequest,
  BookingResponse,
  CreateEventRequest,
  EmailOutboxSummary,
  ErrorResponse,
  EventDetail,
  EventSummary,
  LoginRequest,
  MyBookingSummary,
  RegisterRequest,
  SeatAvailability,
  UpdateEventRequest,
  UserProfile,
  WaitlistEntrySummary,
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

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
let csrfTokenRequest: Promise<void> | null = null;

function isUnsafeMethod(method?: string) {
  return UNSAFE_METHODS.has((method ?? 'GET').toUpperCase());
}

function readCookie(name: string) {
  return document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split('=')
    .slice(1)
    .join('=');
}

async function ensureCsrfToken() {
  if (readCookie('XSRF-TOKEN')) {
    return;
  }

  csrfTokenRequest ??= fetch('/api/auth/csrf', {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  }).then((response) => {
    if (!response.ok) {
      throw new ApiError(response.status, 'CSRF_TOKEN_ERROR', 'Could not initialize request security', undefined);
    }
  }).finally(() => {
    csrfTokenRequest = null;
  });

  await csrfTokenRequest;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const method = init?.method ?? 'GET';
  const headers = new Headers(init?.headers);

  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  headers.set('Accept', headers.get('Accept') ?? 'application/json');

  if (isUnsafeMethod(method)) {
    await ensureCsrfToken();
    const csrfToken = readCookie('XSRF-TOKEN');

    if (csrfToken) {
      headers.set('X-XSRF-TOKEN', decodeURIComponent(csrfToken));
    }
  }

  const response = await fetch(path, {
    credentials: 'include',
    ...init,
    headers,
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

  if (response.status === 204) {
    return undefined as T;
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

export function logoutUser() {
  return request<void>('/api/auth/logout', {
    method: 'POST',
  });
}

export function getEvents() {
  return request<EventSummary[]>('/api/events');
}

export function getAdminEvents() {
  return request<AdminEventSummary[]>('/api/admin/events');
}

export function getEvent(eventId: string) {
  return request<EventDetail>(`/api/events/${eventId}`);
}

export function createEvent(payload: CreateEventRequest) {
  return request<EventDetail>('/api/events', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateEvent(eventId: string, payload: UpdateEventRequest) {
  return request<EventDetail>(`/api/events/${eventId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function publishEvent(eventId: string) {
  return request<EventDetail>(`/api/events/${eventId}/publish`, { method: 'POST' });
}

export function unpublishEvent(eventId: string) {
  return request<EventDetail>(`/api/events/${eventId}/unpublish`, { method: 'POST' });
}

export function cancelEvent(eventId: string) {
  return request<EventDetail>(`/api/events/${eventId}/cancel`, { method: 'POST' });
}

export function deleteEvent(eventId: string) {
  return request<void>(`/api/events/${eventId}`, { method: 'DELETE' });
}

export function getEventSeats(eventId: string) {
  return request<SeatAvailability[]>(`/api/events/${eventId}/seats`);
}

export function createBooking(payload: BookingCreateRequest) {
  return request<BookingResponse>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function createBatchBooking(payload: BookingBatchCreateRequest) {
  return request<BookingBatchResponse>('/api/bookings/batch', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getMyBookings() {
  return request<MyBookingSummary[]>('/api/users/me/bookings');
}

export function cancelBooking(bookingId: string) {
  return request<void>(`/api/bookings/${bookingId}`, {
    method: 'DELETE',
  });
}

export function getAdminEventBookings(eventId: string) {
  return request<AdminEventBookingSummary[]>(`/api/admin/events/${eventId}/bookings`);
}

export function joinWaitlist(eventId: string) {
  return request<void>(`/api/events/${eventId}/waitlist`, { method: 'POST' });
}

export function leaveWaitlist(eventId: string) {
  return request<void>(`/api/events/${eventId}/waitlist`, { method: 'DELETE' });
}

export function getMyWaitlist() {
  return request<WaitlistEntrySummary[]>('/api/users/me/waitlist');
}

export function getAdminEventWaitlist(eventId: string) {
  return request<AdminWaitlistEntry[]>(`/api/admin/events/${eventId}/waitlist`);
}

export function getAdminEmailOutbox() {
  return request<EmailOutboxSummary[]>('/api/admin/email-outbox');
}
