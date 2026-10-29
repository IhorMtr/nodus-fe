import { isAxiosError } from 'axios';

import type { ApiErrorResponse } from '@/shared/api/api-types';

const knownErrorCodes = [
  'InviteNotFound',
  'InviteExpired',
  'InviteRevoked',
  'InviteAlreadyUsed',
  'AlreadyWorkspaceMember',
  'InsufficientWorkspaceRole',
  'WorkspaceNotFound',
  'ValidationFailed',
  'Unauthorized',
  'AccessTokenExpired',
] as const;

type KnownInviteError = (typeof knownErrorCodes)[number];
type InviteErrorKey = KnownInviteError | 'networkError' | 'requestFailed';
const knownErrors: ReadonlySet<string> = new Set(knownErrorCodes);

export function getInviteErrorKey(error: unknown): InviteErrorKey {
  if (!isAxiosError<ApiErrorResponse>(error)) {
    return 'requestFailed';
  }

  if (!error.response) {
    return 'networkError';
  }

  const code = error.response.data?.messageType;
  return code && knownErrors.has(code)
    ? (code as KnownInviteError)
    : 'requestFailed';
}
