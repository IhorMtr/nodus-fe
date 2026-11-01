import { isAxiosError } from 'axios';

import type { ApiErrorResponse } from '@/shared/api/api-types';

// ==================== ERROR MAPPING ====================

export function getAnnouncementErrorKey(error: unknown) {
  if (!isAxiosError<ApiErrorResponse>(error)) {
    return 'requestFailed' as const;
  }

  if (!error.response) {
    return 'networkError' as const;
  }

  switch (error.response.data?.messageType) {
    case 'AnnouncementAlreadyPublished':
      return 'alreadyPublished' as const;
    case 'AnnouncementConflict':
      return 'conflict' as const;
    case 'InvalidPublishAt':
      return 'invalidPublishAt' as const;
    case 'AnnouncementNotFound':
      return 'notFound' as const;
    case 'WorkspaceNotFound':
      return 'workspaceNotFound' as const;
    case 'InsufficientWorkspaceRole':
      return 'accessDenied' as const;
    case 'ValidationFailed':
      return 'validationFailed' as const;
    case 'Unauthorized':
    case 'AccessTokenExpired':
      return 'sessionExpired' as const;
    default:
      return 'requestFailed' as const;
  }
}
