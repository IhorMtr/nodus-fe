import type { ApiSuccessResponse } from '@/shared/api/api-types';
import { httpClient } from '@/shared/api/http-client';

import type { User } from '../model/current-user/user-types';

export const userApi = {
  async getMe(signal?: AbortSignal): Promise<User> {
    const { data } = await httpClient.get<ApiSuccessResponse<User>>(
      '/users/me',
      {
        signal,
      }
    );
    return data.data;
  },
};
