import type { ApiSuccessResponse } from '@/shared/api/api-types';
import { httpClient } from '@/shared/api/http-client';

import type { CreateWorkspaceRequest } from '../model/create-workspace/create-workspace-types';
import type { Workspace } from '../model/workspace/workspace-types';

export const workspaceApi = {
  async list(signal?: AbortSignal): Promise<Workspace[]> {
    const { data } = await httpClient.get<ApiSuccessResponse<Workspace[]>>(
      '/workspaces',
      { signal }
    );
    return data.data;
  },

  async getById(workspaceId: string, signal?: AbortSignal): Promise<Workspace> {
    const { data } = await httpClient.get<ApiSuccessResponse<Workspace>>(
      `/workspaces/${encodeURIComponent(workspaceId)}`,
      { signal }
    );
    return data.data;
  },

  async create(payload: CreateWorkspaceRequest): Promise<Workspace> {
    const { data } = await httpClient.post<ApiSuccessResponse<Workspace>>(
      '/workspaces',
      payload
    );
    return data.data;
  },
};
