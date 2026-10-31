import { isAxiosError } from 'axios';

import type { ApiErrorResponse } from '@/shared/api/api-types';

// ==================== ERROR MAPPING ====================

export function getWorkspaceManagementErrorKey(error: unknown) {
  if (!isAxiosError<ApiErrorResponse>(error)) {
    return 'requestFailed' as const;
  }

  if (!error.response) {
    return 'networkError' as const;
  }

  switch (error.response.status) {
    case 400:
      return 'validationFailed' as const;
    case 401:
      return 'sessionExpired' as const;
    case 403:
      return 'accessDenied' as const;
    case 404:
      return 'notFound' as const;
    default:
      return 'requestFailed' as const;
  }
}
