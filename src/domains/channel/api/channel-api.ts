import type { ApiSuccessResponse } from '@/shared/api/api-types';
import { httpClient } from '@/shared/api/http-client';

import type { Channel } from '../model/channel/channel-types';

export const channelApi = {
  async create(workspaceId: string, name: string): Promise<Channel> {
    const { data } = await httpClient.post<ApiSuccessResponse<Channel>>(
      `/workspaces/${encodeURIComponent(workspaceId)}/channels`,
      { name }
    );
    return data.data;
  },

  async rename(
    workspaceId: string,
    channelId: string,
    name: string
  ): Promise<Channel> {
    const { data } = await httpClient.patch<ApiSuccessResponse<Channel>>(
      `/workspaces/${encodeURIComponent(workspaceId)}/channels/${encodeURIComponent(channelId)}`,
      { name }
    );
    return data.data;
  },

  async remove(workspaceId: string, channelId: string): Promise<void> {
    await httpClient.delete(
      `/workspaces/${encodeURIComponent(workspaceId)}/channels/${encodeURIComponent(channelId)}`
    );
  },

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
