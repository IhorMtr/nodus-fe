import { object, string } from 'yup';

export type LoginValidationKey =
  | 'emailRequired'
  | 'emailInvalid'
  | 'emailTooLong'
  | 'passwordRequired'
  | 'passwordTooLong';

export function createLoginSchema(
  translate: (key: LoginValidationKey) => string
) {
  return object({
    email: string()
      .trim()
      .lowercase()
      .required(translate('emailRequired'))
      .email(translate('emailInvalid'))
      .max(254, translate('emailTooLong')),
    password: string()
      .required(translate('passwordRequired'))
      .max(128, translate('passwordTooLong')),
  });
}
