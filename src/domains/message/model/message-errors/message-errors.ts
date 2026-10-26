import { isAxiosError } from 'axios';

import { AuthError } from '@/domains/auth/model/errors';
import type { ApiErrorResponse } from '@/shared/api/api-types';

type MessageErrorKey =
  | 'validationFailed'
  | 'networkError'
  | 'sessionExpired'
  | 'sessionChanged'
  | 'accessDenied'
  | 'notFound'
  | 'messageNotFound'
  | 'requestFailed';

export function isMessageNotFound(error: unknown) {
  return (
    isAxiosError<ApiErrorResponse>(error) &&
    error.response?.status === 404 &&
    error.response.data?.messageType === 'MessageNotFound'
  );
}

export function getMessageErrorKey(error: unknown): MessageErrorKey {
  if (error instanceof AuthError && error.messageType === 'SessionChanged') {
    return 'sessionChanged';
  }
  if (!isAxiosError<ApiErrorResponse>(error)) return 'requestFailed';
  if (!error.response) return 'networkError';

  switch (error.response.status) {
    case 400:
      return 'validationFailed';
    case 401:
      return 'sessionExpired';
    case 403:
      return 'accessDenied';
    case 404:
      return isMessageNotFound(error) ? 'messageNotFound' : 'notFound';
    default:
      return 'requestFailed';
  }
}
