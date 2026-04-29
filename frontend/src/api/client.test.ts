import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loginUser, getEvents } from './client';

function clearCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; path=/`;
}

describe('api client CSRF handling', () => {
  beforeEach(() => {
    clearCookie('XSRF-TOKEN');
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();

      if (url === '/api/auth/csrf') {
        document.cookie = 'XSRF-TOKEN=csrf-token; path=/';
        return new Response(null, {
          status: 204,
          headers: { 'Set-Cookie': 'XSRF-TOKEN=csrf-token; Path=/' },
        });
      }

      if (url === '/api/auth/login') {
        return Response.json({ id: 'user-1', name: 'Alice', email: 'alice@example.com', role: 'USER' }, { status: 200 });
      }

      if (url === '/api/events') {
        return Response.json([], { status: 200 });
      }

      return Response.json({ code: 'NOT_FOUND', message: `Unhandled ${url}` }, { status: 404 });
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    clearCookie('XSRF-TOKEN');
  });

  it('bootstraps and sends a CSRF header for unsafe requests', async () => {
    await loginUser({ email: 'alice@example.com', password: 'Password123!' });

    expect(fetch).toHaveBeenNthCalledWith(1, '/api/auth/csrf', expect.objectContaining({
      credentials: 'include',
    }));
    expect(fetch).toHaveBeenNthCalledWith(2, '/api/auth/login', expect.objectContaining({
      method: 'POST',
      headers: expect.any(Headers),
    }));

    const loginHeaders = vi.mocked(fetch).mock.calls[1][1]?.headers as Headers;
    expect(loginHeaders.get('X-XSRF-TOKEN')).toBe('csrf-token');
  });

  it('does not bootstrap CSRF for safe requests', async () => {
    await getEvents();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/api/events', expect.objectContaining({
      credentials: 'include',
    }));
  });
});
