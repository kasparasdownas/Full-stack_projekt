import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../api/client';
import { AdminRoute } from './AdminRoute';

const useCurrentUserQueryMock = vi.fn();

vi.mock('../features/auth/useAuth', () => ({
  useCurrentUserQuery: () => useCurrentUserQueryMock(),
}));

function renderAdminRoute(initialPath = '/admin/events/new') {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<h1>Log in</h1>} />
          <Route element={<AdminRoute />}>
            <Route path="/admin/events/new" element={<h1>Create event</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('AdminRoute', () => {
  it('renders protected admin content when the user is an admin', () => {
    useCurrentUserQueryMock.mockReturnValue({
      isLoading: false,
      data: { id: '1', name: 'Admin', email: 'admin@example.com', role: 'ADMIN' },
      error: null,
    });

    renderAdminRoute();

    expect(screen.getByRole('heading', { name: 'Create event' })).toBeInTheDocument();
  });

  it('shows an access-denied panel for authenticated non-admin users', () => {
    useCurrentUserQueryMock.mockReturnValue({
      isLoading: false,
      data: { id: '2', name: 'Alice', email: 'alice@example.com', role: 'USER' },
      error: null,
    });

    renderAdminRoute();

    expect(screen.getByText('You do not have permission to access this page.')).toBeInTheDocument();
  });

  it('redirects to login when the session is missing', () => {
    useCurrentUserQueryMock.mockReturnValue({
      isLoading: false,
      data: null,
      error: new ApiError(401, 'UNAUTHORIZED', 'Authentication is required', []),
    });

    renderAdminRoute();

    expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument();
  });
});
