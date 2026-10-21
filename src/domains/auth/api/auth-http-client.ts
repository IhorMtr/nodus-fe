import axios, { AxiosError } from 'axios';

export const authHttpClient = axios.create({
  baseURL: '/api/auth',
  withCredentials: true,
});

authHttpClient.interceptors.response.use(response => {
  // Reject unexpected bodies without discarding the original error envelope.
  if (response.data?.success !== true || response.data.data === undefined) {
    throw new AxiosError(
      'Unexpected API response',
      AxiosError.ERR_BAD_RESPONSE,
      response.config,
      response.request,
      response
    );
  }
  return response;
});
