'use client';

import { useMutation } from '@tanstack/react-query';

import { authApi } from '../../api/auth-api';
import { authLifecycle } from '../session';

import type { LoginRequest } from './login-types';

export function useLoginMutation() {
  return useMutation({
    mutationFn: (payload: LoginRequest) =>
      authLifecycle.authenticate(() => authApi.login(payload)),
    retry: false,
  });
}
