import type { ApiSuccessResponse } from '@/shared/api/api-types';
import { httpClient } from '@/shared/api/http-client';

import type {
  AcceptedInvite,
  CreatedInvite,
  ResolvedInvite,
  WorkspaceInvite,
} from '../model/invitations/invite-types';

function invitesPath(workspaceId: string) {
  return `/workspaces/${encodeURIComponent(workspaceId)}/invites`;
}

export const inviteApi = {
  async create(workspaceId: string): Promise<CreatedInvite> {
    const { data } = await httpClient.post<ApiSuccessResponse<CreatedInvite>>(
      invitesPath(workspaceId)
    );
    return data.data;
  },

  async list(
    workspaceId: string,
    signal?: AbortSignal
  ): Promise<WorkspaceInvite[]> {
    const { data } = await httpClient.get<
      ApiSuccessResponse<WorkspaceInvite[]>
    >(invitesPath(workspaceId), { signal });
    return data.data;
  },

  async revoke(workspaceId: string, inviteId: string): Promise<void> {
    await httpClient.delete(
      `${invitesPath(workspaceId)}/${encodeURIComponent(inviteId)}`
    );
  },

  async resolve(token: string): Promise<ResolvedInvite> {
    const { data } = await httpClient.post<ApiSuccessResponse<ResolvedInvite>>(
      '/invites/resolve',
      { token }
    );
    return data.data;
  },

  async accept(token: string): Promise<AcceptedInvite> {
    const { data } = await httpClient.post<ApiSuccessResponse<AcceptedInvite>>(
      '/invites/accept',
      { token }
    );
    return data.data;
  },
};
