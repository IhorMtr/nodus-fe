import { getHttpStatus } from '@/shared/api/http-error';

export function retryQuery(failureCount: number, error: unknown): boolean {
  const status = getHttpStatus(error);

  return (
    !(status !== undefined && [400, 401, 403, 404].includes(status)) &&
    failureCount < 3
  );
}
