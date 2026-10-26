import type { ApiSuccessResponse } from '@/shared/api/api-types';
import { httpClient } from '@/shared/api/http-client';

import type {
  Message,
  MessageHistory,
} from '../model/message-history/message-types';

function messagesPath(workspaceId: string, channelId: string) {
  return `/workspaces/${encodeURIComponent(workspaceId)}/channels/${encodeURIComponent(channelId)}/messages`;
}

export const messageApi = {
  async list(
    workspaceId: string,
    channelId: string,
    params: { before?: string; limit?: number },
    signal?: AbortSignal
  ): Promise<MessageHistory> {
    const { data } = await httpClient.get<ApiSuccessResponse<MessageHistory>>(
      messagesPath(workspaceId, channelId),
      { params, signal }
    );
    return data.data;
  },

  async create(
    workspaceId: string,
    channelId: string,
    content: string
  ): Promise<Message> {
    const { data } = await httpClient.post<ApiSuccessResponse<Message>>(
      messagesPath(workspaceId, channelId),
      { content }
    );
    return data.data;
  },

  async update(
    workspaceId: string,
    channelId: string,
    messageId: string,
    content: string
  ): Promise<Message> {
    const { data } = await httpClient.patch<ApiSuccessResponse<Message>>(
      `${messagesPath(workspaceId, channelId)}/${encodeURIComponent(messageId)}`,
      { content }
    );
    return data.data;
  },

  async delete(
    workspaceId: string,
    channelId: string,
    messageId: string
  ): Promise<void> {
    await httpClient.delete(
      `${messagesPath(workspaceId, channelId)}/${encodeURIComponent(messageId)}`
    );
  },
};
