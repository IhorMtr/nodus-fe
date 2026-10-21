import { isAxiosError } from 'axios';

// ==================== ERROR CONTRACTS ====================

export interface AuthErrorResponse {
  success: false;
  data: null;
  messageType: string;
  errors: Record<string, string[]> | null;
}

type AuthField =
  'firstName' | 'lastName' | 'email' | 'password' | 'confirmPassword';

type AuthMessageKey =
  | 'invalidCredentials'
  | 'emailAlreadyExists'
  | 'validationFailed'
  | 'tooManyRequests'
  | 'internalError'
  | 'networkError'
  | 'sessionExpired'
  | 'sessionChanged'
  | 'invalidField';

interface AuthErrorFeedback {
  formError: string;
  fieldErrors: Partial<Record<AuthField, string>>;
}

// ==================== MESSAGE MAPPING ====================

const messageKeys = new Map<string, AuthMessageKey>([
  ['InvalidCredentials', 'invalidCredentials'],
  ['EmailAlreadyExists', 'emailAlreadyExists'],
  ['ValidationFailed', 'validationFailed'],
  ['InvalidJson', 'validationFailed'],
  ['TooManyRequests', 'tooManyRequests'],
  ['InternalError', 'internalError'],
  ['NetworkError', 'networkError'],
  ['InvalidRefreshToken', 'sessionExpired'],
  ['RefreshTokenExpired', 'sessionExpired'],
  ['SessionRevoked', 'sessionExpired'],
  ['RefreshTokenReused', 'sessionExpired'],
  ['SessionChanged', 'sessionChanged'],
]);

const fields: AuthField[] = [
  'firstName',
  'lastName',
  'email',
  'password',
  'confirmPassword',
];

// ==================== ERROR NORMALIZATION ====================

export class AuthError extends Error {
  constructor(
    public readonly messageType: string,
    public readonly fieldErrors: Record<string, string[]> | null = null,
    options?: ErrorOptions
  ) {
    super(messageType, options);
    this.name = 'AuthError';
  }

  static from(error: unknown): AuthError {
    if (error instanceof AuthError) return error;

    if (isAxiosError<AuthErrorResponse>(error)) {
      const response = error.response;
      if (!response)
        return new AuthError('NetworkError', null, { cause: error });
      if (response.data?.success === false) {
        return new AuthError(response.data.messageType, response.data.errors, {
          cause: error,
        });
      }
      if (response.status === 429)
        return new AuthError('TooManyRequests', null, { cause: error });
    }

    return new AuthError('InternalError', null, { cause: error });
  }
}

// ==================== FORM FEEDBACK ====================

export function getAuthErrorFeedback(
  error: unknown,
  translate: (key: AuthMessageKey) => string
): AuthErrorFeedback {
  const authError = AuthError.from(error);
  const fieldErrors: AuthErrorFeedback['fieldErrors'] = {};

  for (const [serverField, messages] of Object.entries(
    authError.fieldErrors ?? {}
  )) {
    const field = fields.find(
      name => name.toLowerCase() === serverField.toLowerCase()
    );

    if (field && messages.length > 0) {
      fieldErrors[field] = translate('invalidField');
    }
  }

  if (authError.messageType === 'EmailAlreadyExists') {
    fieldErrors.email = translate('emailAlreadyExists');
  }

  // Server messages, including _form, are never displayed as raw text.
  return {
    formError: translate(
      messageKeys.get(authError.messageType) ?? 'internalError'
    ),
    fieldErrors,
  };
}
