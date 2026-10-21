import { isAxiosError } from 'axios';

export function retryQuery(failureCount: number, error: unknown): boolean {
  const status = isAxiosError(error) ? error.response?.status : undefined;

  return (
    !(status !== undefined && [400, 401, 403, 404].includes(status)) &&
    failureCount < 3
  );
}
