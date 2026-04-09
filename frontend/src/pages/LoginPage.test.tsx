import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { LoginPage } from './LoginPage';

const mutateAsyncMock = vi.fn();
const useCurrentUserQueryMock = vi.fn();

vi.mock('../features/auth/useAuth', () => ({
  useCurrentUserQuery: () => useCurrentUserQueryMock(),
  useLoginMutation: () => ({
    mutateAsync: mutateAsyncMock,
    isPending: false,
    error: null,
  }),
}));

describe('LoginPage', () => {
  it('submits credentials to the login mutation', async () => {
    useCurrentUserQueryMock.mockReturnValue({ data: null });
    mutateAsyncMock.mockResolvedValue(undefined);

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'alice@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() =>
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        email: 'alice@example.com',
        password: 'Password123!',
      }),
    );
  });

  it('prefills email and shows a success message after registration', async () => {
    useCurrentUserQueryMock.mockReturnValue({ data: null });
    mutateAsyncMock.mockResolvedValue(undefined);

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/login',
              state: {
                registeredEmail: 'new.student@example.com',
                registrationSucceeded: true,
              },
            },
          ]}
        >
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('Account created. Log in to continue.')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveValue('new.student@example.com');
    expect(screen.getByLabelText('Password')).toHaveValue('');
  });

  it('preserves the protected-route redirect after login', async () => {
    useCurrentUserQueryMock.mockReturnValue({ data: null });
    mutateAsyncMock.mockResolvedValue(undefined);

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/login',
              state: {
                from: '/events/event-1',
              },
            },
          ]}
        >
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/events/:eventId" element={<h1>Event detail</h1>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Event detail' })).toBeInTheDocument());
  });
});
