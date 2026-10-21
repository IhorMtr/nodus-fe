import type { LoginRequest } from '../login/login-types';

export interface RegisterRequest extends LoginRequest {
  firstName: string;
  lastName: string;
  confirmPassword: string;
}
