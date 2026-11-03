import type { ApiSuccessResponse } from '@/shared/api/api-types';
import { httpClient } from '@/shared/api/http-client';

import type {
  PresenceUpdate,
  SelectablePresenceStatus,
} from '../model/presence-status/presence-types';

// ==================== TRANSPORT ====================

export const presenceApi = {
  async updateStatus(
    status: SelectablePresenceStatus
  ): Promise<PresenceUpdate> {
    const { data } = await httpClient.patch<ApiSuccessResponse<PresenceUpdate>>(
      '/users/me/status',
      { status }
    );
    return data.data;
  },
};
