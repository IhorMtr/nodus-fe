'use client';

import { useMutation } from '@tanstack/react-query';

import { authApi } from '../../api/auth-api';
import { authLifecycle } from '../session';

import type { RegisterRequest } from './register-types';

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (payload: RegisterRequest) =>
      authLifecycle.authenticate(() => authApi.register(payload)),
    retry: false,
  });
}
