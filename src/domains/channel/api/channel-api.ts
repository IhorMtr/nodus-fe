import type { ApiSuccessResponse } from '@/shared/api/api-types';
import { httpClient } from '@/shared/api/http-client';

import type { Channel } from '../model/channel/channel-types';

export const channelApi = {
  async list(workspaceId: string, signal?: AbortSignal): Promise<Channel[]> {
    const { data } = await httpClient.get<ApiSuccessResponse<Channel[]>>(
      `/workspaces/${encodeURIComponent(workspaceId)}/channels`,
      { signal }
    );
    return data.data;
  },

  async getById(
    workspaceId: string,
    channelId: string,
    signal?: AbortSignal
  ): Promise<Channel> {
    const { data } = await httpClient.get<ApiSuccessResponse<Channel>>(
      `/workspaces/${encodeURIComponent(workspaceId)}/channels/${encodeURIComponent(channelId)}`,
      { signal }
    );
    return data.data;
  },
};
