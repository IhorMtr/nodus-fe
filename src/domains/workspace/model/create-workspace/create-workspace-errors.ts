import { isAxiosError } from 'axios';

import { AuthError } from '@/domains/auth/model/errors';
import type { ApiErrorResponse } from '@/shared/api/api-types';

type CreateWorkspaceErrorKey =
  | 'validationFailed'
  | 'invalidName'
  | 'networkError'
  | 'requestFailed'
  | 'accessDenied'
  | 'sessionExpired'
  | 'sessionChanged';

interface CreateWorkspaceErrorFeedback {
  formError: string;
  fieldErrors: { name?: string };
}

export function getCreateWorkspaceErrorFeedback(
  error: unknown,
  translate: (key: CreateWorkspaceErrorKey) => string
): CreateWorkspaceErrorFeedback {
  let messageKey: CreateWorkspaceErrorKey = 'requestFailed';
  const fieldErrors: CreateWorkspaceErrorFeedback['fieldErrors'] = {};

  if (error instanceof AuthError && error.messageType === 'SessionChanged') {
    messageKey = 'sessionChanged';
  } else if (isAxiosError<ApiErrorResponse>(error)) {
    const response = error.response;

    if (!response) {
      messageKey = 'networkError';
    } else if (response.status === 401) {
      messageKey = 'sessionExpired';
    } else if (response.status === 403) {
      messageKey = 'accessDenied';
    } else if (
      response.status === 400 ||
      response.data?.messageType === 'ValidationFailed' ||
      response.data?.messageType === 'InvalidJson'
    ) {
      messageKey = 'validationFailed';
      const nameErrors = Object.entries(response.data?.errors ?? {}).find(
        ([field]) => field.toLowerCase() === 'name'
      )?.[1];

      if (nameErrors?.length) fieldErrors.name = translate('invalidName');
    }
  }

  // Field and request-level server messages are translated, never shown verbatim.
  return { formError: translate(messageKey), fieldErrors };
}
