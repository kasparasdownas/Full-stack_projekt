import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, getCurrentUser, logoutUser } from '../api/client';
import { ProtectedRoute } from './ProtectedRoute';
import { AppShell } from './AppShell';

vi.mock('../api/client', async () => {
  const actual = await vi.importActual<typeof import('../api/client')>('../api/client');

  return {
    ...actual,
    getCurrentUser: vi.fn(),
    logoutUser: vi.fn(),
  };
});

const getCurrentUserMock = vi.mocked(getCurrentUser);
const logoutUserMock = vi.mocked(logoutUser);

describe('AppShell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows logout for authenticated users and returns to logged-out navigation after logout', async () => {
    let isAuthenticated = true;

    getCurrentUserMock.mockImplementation(async () => {
      if (isAuthenticated) {
        return {
          id: 'user-1',
          name: 'Alice Example',
          email: 'alice@example.com',
          role: 'USER',
        };
      }

      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication is required', []);
    });

    logoutUserMock.mockImplementation(async () => {
      isAuthenticated = false;
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          refetchOnWindowFocus: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/events']}>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<h1>Home</h1>} />
              <Route path="/login" element={<h1>Log in</h1>} />
              <Route element={<ProtectedRoute />}>
                <Route path="/events" element={<h1>Events</h1>} />
              </Route>
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByRole('button', { name: 'Log out' });
    expect(screen.getByRole('link', { name: 'My bookings' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Log out' }));

    await waitFor(() => expect(logoutUserMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument());
    await waitFor(() => expect(screen.getByRole('link', { name: 'Log in' })).toBeInTheDocument());
    expect(screen.getByRole('link', { name: 'Register' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'My bookings' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: 'Events' }));

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument());
  });
});
