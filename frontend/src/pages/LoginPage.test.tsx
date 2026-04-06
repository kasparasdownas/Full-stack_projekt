import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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
});

