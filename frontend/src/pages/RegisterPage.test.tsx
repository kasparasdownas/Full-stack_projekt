import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { RegisterPage } from './RegisterPage';

const mutateAsyncMock = vi.fn();
const useCurrentUserQueryMock = vi.fn();

vi.mock('../features/auth/useAuth', () => ({
  useCurrentUserQuery: () => useCurrentUserQueryMock(),
  useRegisterMutation: () => ({
    mutateAsync: mutateAsyncMock,
    isPending: false,
    error: null,
  }),
}));

function LoginStateProbe() {
  const location = useLocation();
  const state = (location.state as { registeredEmail?: string; registrationSucceeded?: boolean } | null) ?? null;

  return (
    <div>
      <h1>Log in</h1>
      <p>{state?.registeredEmail ?? 'missing-email'}</p>
      <p>{state?.registrationSucceeded ? 'registration-success' : 'registration-missing'}</p>
    </div>
  );
}

describe('RegisterPage', () => {
  it('redirects to login with the new email in navigation state after registration', async () => {
    useCurrentUserQueryMock.mockReturnValue({ data: null });
    mutateAsyncMock.mockResolvedValue(undefined);

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginStateProbe />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New Student' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new.student@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() =>
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        name: 'New Student',
        email: 'new.student@example.com',
        password: 'Password123!',
      }),
    );

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument());
    expect(screen.getByText('new.student@example.com')).toBeInTheDocument();
    expect(screen.getByText('registration-success')).toBeInTheDocument();
  });
});
