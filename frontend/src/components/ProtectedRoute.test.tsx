import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../api/client';
import { ProtectedRoute } from './ProtectedRoute';

const useCurrentUserQueryMock = vi.fn();

vi.mock('../features/auth/useAuth', () => ({
  useCurrentUserQuery: () => useCurrentUserQueryMock(),
}));

function renderProtectedRoute(initialPath = '/events') {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<h1>Log in</h1>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/events" element={<h1>Events</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ProtectedRoute', () => {
  it('renders protected content when the user is authenticated', () => {
    useCurrentUserQueryMock.mockReturnValue({
      isLoading: false,
      data: { id: '1', name: 'Alice', email: 'alice@example.com', role: 'USER' },
      error: null,
    });

    renderProtectedRoute();

    expect(screen.getByRole('heading', { name: 'Events' })).toBeInTheDocument();
  });

  it('redirects to login when the session is missing', () => {
    useCurrentUserQueryMock.mockReturnValue({
      isLoading: false,
      data: null,
      error: new ApiError(401, 'UNAUTHORIZED', 'Authentication is required', []),
    });

    renderProtectedRoute();

    expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument();
  });
});

