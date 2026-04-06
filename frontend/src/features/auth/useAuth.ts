import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, loginUser, registerUser } from '../../api/client';
import type { LoginRequest, RegisterRequest } from '../../api/types';

export const authQueryKey = ['auth', 'me'] as const;

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: authQueryKey,
    queryFn: getCurrentUser,
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (payload: RegisterRequest) => registerUser(payload),
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginRequest) => loginUser(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authQueryKey });
    },
  });
}

