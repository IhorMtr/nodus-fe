import axios from 'axios';

import { installHttpAuthentication } from './http-authentication';

export const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

installHttpAuthentication(httpClient);
