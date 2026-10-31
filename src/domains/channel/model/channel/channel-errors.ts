import { isAxiosError } from 'axios';

import { AuthError } from '@/domains/auth/model/errors';
import type { ApiErrorResponse } from '@/shared/api/api-types';

export type ChannelErrorKey =
  | 'duplicateName'
  | 'validationFailed'
  | 'accessDenied'
  | 'notFound'
  | 'sessionExpired'
  | 'sessionChanged'
  | 'networkError'
  | 'requestFailed';

export function getChannelErrorKey(error: unknown): ChannelErrorKey {
  if (error instanceof AuthError && error.messageType === 'SessionChanged') {
    return 'sessionChanged';
  }

  if (!isAxiosError<ApiErrorResponse>(error)) {
    return 'requestFailed';
  }

  if (!error.response) {
    return 'networkError';
  }

  const { status, data } = error.response;
  if (status === 409 || data?.messageType === 'ChannelNameAlreadyExists') {
    return 'duplicateName';
  }
  if (status === 400 || data?.messageType === 'ValidationFailed') {
    return 'validationFailed';
  }
  if (status === 401) {
    return 'sessionExpired';
  }
  if (status === 403) {
    return 'accessDenied';
  }
  if (status === 404) {
    return 'notFound';
  }
  return 'requestFailed';
}
