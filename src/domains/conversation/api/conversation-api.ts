import type { ApiSuccessResponse } from '@/shared/api/api-types';
import { httpClient } from '@/shared/api/http-client';

import type {
  Conversation,
  DirectHistory,
  DirectMessage,
  DirectReadState,
} from '../model/conversations/conversation-types';

// ==================== PATHS ====================

function conversationPath(workspaceId: string, conversationId?: string) {
  const base = `/workspaces/${encodeURIComponent(workspaceId)}/conversations`;
  return conversationId
    ? `${base}/${encodeURIComponent(conversationId)}`
    : base;
}

// ==================== TRANSPORT ====================

export const conversationApi = {
  async list(
    workspaceId: string,
    signal?: AbortSignal
  ): Promise<Conversation[]> {
    const { data } = await httpClient.get<ApiSuccessResponse<Conversation[]>>(
      conversationPath(workspaceId),
      { signal }
    );
    return data.data;
  },
  async open(workspaceId: string, userId: string): Promise<Conversation> {
    const { data } = await httpClient.post<ApiSuccessResponse<Conversation>>(
      conversationPath(workspaceId),
      { userId }
    );
    return data.data;
  },
  async history(
    workspaceId: string,
    conversationId: string,
    before?: string,
    signal?: AbortSignal
  ): Promise<DirectHistory> {
    const { data } = await httpClient.get<ApiSuccessResponse<DirectHistory>>(
      `${conversationPath(workspaceId, conversationId)}/messages`,
      { params: { before, limit: 50 }, signal }
    );
    return data.data;
  },
  async send(
    workspaceId: string,
    conversationId: string,
    content: string
  ): Promise<DirectMessage> {
    const { data } = await httpClient.post<ApiSuccessResponse<DirectMessage>>(
      `${conversationPath(workspaceId, conversationId)}/messages`,
      { content }
    );
    return data.data;
  },
  async update(
    workspaceId: string,
    conversationId: string,
    messageId: string,
    content: string
  ): Promise<DirectMessage> {
    const { data } = await httpClient.patch<ApiSuccessResponse<DirectMessage>>(
      `${conversationPath(workspaceId, conversationId)}/messages/${encodeURIComponent(messageId)}`,
      { content }
    );
    return data.data;
  },
  async remove(
    workspaceId: string,
    conversationId: string,
    messageId: string
  ): Promise<void> {
    await httpClient.delete(
      `${conversationPath(workspaceId, conversationId)}/messages/${encodeURIComponent(messageId)}`
    );
  },
  async markRead(
    workspaceId: string,
    conversationId: string,
    lastReadMessageId: string
  ): Promise<DirectReadState> {
    const { data } = await httpClient.put<ApiSuccessResponse<DirectReadState>>(
      `${conversationPath(workspaceId, conversationId)}/read-state`,
      { lastReadMessageId }
    );
    return data.data;
  },
};
