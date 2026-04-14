import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { DEMO_ACCOUNTS } from '../features/auth/demoAccounts';
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
  it('renders empty fields and demo account quick-fill actions by default', () => {
    useCurrentUserQueryMock.mockReturnValue({ data: null });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByLabelText('Email')).toHaveValue('');
    expect(screen.getByLabelText('Password')).toHaveValue('');

    for (const account of DEMO_ACCOUNTS) {
      expect(screen.getByRole('button', { name: account.label })).toBeInTheDocument();
    }
  });

  it.each(DEMO_ACCOUNTS)('fills the form when %s is selected', (account) => {
    useCurrentUserQueryMock.mockReturnValue({ data: null });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: account.label }));

    expect(screen.getByLabelText('Email')).toHaveValue(account.email);
    expect(screen.getByLabelText('Password')).toHaveValue(account.password);
  });

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

  it('lets a demo shortcut overwrite the registration handoff values', () => {
    useCurrentUserQueryMock.mockReturnValue({ data: null });

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

    fireEvent.click(screen.getByRole('button', { name: 'Admin' }));

    expect(screen.getByLabelText('Email')).toHaveValue('admin@example.com');
    expect(screen.getByLabelText('Password')).toHaveValue('Admin123!');
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

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'alice@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Event detail' })).toBeInTheDocument());
  });
});
