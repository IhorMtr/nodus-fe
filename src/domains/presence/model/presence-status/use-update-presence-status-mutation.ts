'use client';

import { useMutation } from '@tanstack/react-query';

import { AuthError } from '@/domains/auth/model/errors';
import { authSessionEvents } from '@/domains/auth/model/session';

import { presenceApi } from '../../api/presence-api';
import type { SelectablePresenceStatus } from './presence-types';

// ==================== MUTATIONS ====================

export function useUpdatePresenceStatusMutation() {
  return useMutation({
    mutationFn: async (status: SelectablePresenceStatus) => {
      const version = authSessionEvents.getVersion();
      const update = await presenceApi.updateStatus(status);

      // A response for a previous session must not reach the current cache.
      if (version !== authSessionEvents.getVersion()) {
        throw new AuthError('SessionChanged');
      }

      return update;
    },
    networkMode: 'always',
    retry: false,
  });
}
