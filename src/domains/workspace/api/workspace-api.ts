import type { ApiSuccessResponse } from '@/shared/api/api-types';
import { httpClient } from '@/shared/api/http-client';

import type { CreateWorkspaceRequest } from '../model/create-workspace/create-workspace-types';
import type {
  Workspace,
  WorkspaceMetrics,
} from '../model/workspace/workspace-types';

// ==================== TRANSPORT ====================

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

  async getMetrics(
    workspaceId: string,
    signal?: AbortSignal
  ): Promise<WorkspaceMetrics> {
    const { data } = await httpClient.get<ApiSuccessResponse<WorkspaceMetrics>>(
      `/workspaces/${encodeURIComponent(workspaceId)}/metrics`,
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

  async rename(workspaceId: string, name: string): Promise<Workspace> {
    const { data } = await httpClient.patch<ApiSuccessResponse<Workspace>>(
      `/workspaces/${encodeURIComponent(workspaceId)}`,
      { name }
    );
    return data.data;
  },

  async remove(workspaceId: string): Promise<void> {
    await httpClient.delete(`/workspaces/${encodeURIComponent(workspaceId)}`);
  },
};
