import type { ApiSuccessResponse } from '@/shared/api/api-types';
import { httpClient } from '@/shared/api/http-client';

import type { WorkspaceMember } from '../model/members/workspace-member-types';

export const workspaceMembersApi = {
  async list(
    workspaceId: string,
    signal?: AbortSignal
  ): Promise<WorkspaceMember[]> {
    const { data } = await httpClient.get<
      ApiSuccessResponse<WorkspaceMember[]>
    >(`/workspaces/${encodeURIComponent(workspaceId)}/members`, { signal });
    return data.data;
  },

  async changeRole(
    workspaceId: string,
    userId: string,
    role: 'Admin' | 'Member'
  ): Promise<void> {
    await httpClient.patch(
      `/workspaces/${encodeURIComponent(workspaceId)}/members/${encodeURIComponent(userId)}/role`,
      { role }
    );
  },

  async remove(workspaceId: string, userId: string): Promise<void> {
    await httpClient.delete(
      `/workspaces/${encodeURIComponent(workspaceId)}/members/${encodeURIComponent(userId)}`
    );
  },
};
