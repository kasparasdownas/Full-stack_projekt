import { performance } from 'node:perf_hooks';

const baseUrl = process.env.BOOKING_BASE_URL ?? 'http://localhost:8080';

function cookiePair(setCookie) {
  return setCookie.split(';')[0];
}

function csrfTokenFromCookie(cookie) {
  const match = cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  if (!match) {
    throw new Error('CSRF cookie did not contain XSRF-TOKEN');
  }

  return decodeURIComponent(match[1]);
}

async function request(path, { cookie, csrfToken, ...init } = {}) {
  const startedAt = performance.now();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...(csrfToken ? { 'X-XSRF-TOKEN': csrfToken } : {}),
      ...init.headers,
    },
  });
  const durationMs = Math.round(performance.now() - startedAt);

  let body = null;
  if (response.status !== 204) {
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      body = await response.json();
    } else {
      body = await response.text();
    }
  }

  return { response, body, durationMs };
}

async function createSession() {
  const { response } = await request('/api/auth/csrf');
  if (!response.ok) {
    throw new Error(`CSRF bootstrap failed: ${response.status}`);
  }

  const setCookie = response.headers.get('set-cookie');
  if (!setCookie) {
    throw new Error('CSRF bootstrap did not return a cookie');
  }

  const cookie = cookiePair(setCookie);
  return { cookie, csrfToken: csrfTokenFromCookie(cookie) };
}

async function login(email, password) {
  const session = await createSession();
  const { response, body } = await request('/api/auth/login', {
    method: 'POST',
    cookie: session.cookie,
    csrfToken: session.csrfToken,
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status} ${body?.message ?? ''}`.trim());
  }

  const setCookie = response.headers.get('set-cookie');
  if (!setCookie) {
    throw new Error('Login did not return an auth cookie');
  }

  return {
    cookie: `${session.cookie}; ${cookiePair(setCookie)}`,
    csrfToken: session.csrfToken,
  };
}

async function measure(label, path, options = {}) {
  const result = await request(path, options);
  if (!result.response.ok) {
    throw new Error(`${label} failed: ${result.response.status}`);
  }

  return { label, method: options.method ?? 'GET', path, status: result.response.status, durationMs: result.durationMs, body: result.body };
}

async function main() {
  console.log(`Measuring baseline against ${baseUrl}`);

  const landing = await measure('Frontend first load', '/', { headers: { Accept: 'text/html' } });
  const alice = await login('alice@example.com', 'Password123!');
  const eventList = await measure('Event list API', '/api/events', { cookie: alice.cookie });

  if (!Array.isArray(eventList.body) || eventList.body.length === 0) {
    throw new Error('Event list did not return any events to measure detail endpoints');
  }

  const eventId = eventList.body[0].id;
  const eventDetail = await measure('Event detail API', `/api/events/${eventId}`, { cookie: alice.cookie });
  const seatAvailability = await measure('Seat availability API', `/api/events/${eventId}/seats`, { cookie: alice.cookie });

  console.table([landing, eventList, eventDetail, seatAvailability].map(({ label, method, path, status, durationMs }) => ({
    metric: label,
    method,
    path,
    status,
    durationMs,
  })));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
