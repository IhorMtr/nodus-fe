import { object, ref, string } from 'yup';

import type { LoginValidationKey } from '../login/login-schema';

type RegisterValidationKey =
  | LoginValidationKey
  | 'firstNameRequired'
  | 'lastNameRequired'
  | 'nameTooLong'
  | 'passwordTooShort'
  | 'passwordUppercase'
  | 'passwordDigit'
  | 'confirmPasswordRequired'
  | 'passwordMismatch';

export function createRegisterSchema(
  translate: (key: RegisterValidationKey) => string
) {
  return object({
    firstName: string()
      .trim()
      .required(translate('firstNameRequired'))
      .max(100, translate('nameTooLong')),
    lastName: string()
      .trim()
      .required(translate('lastNameRequired'))
      .max(100, translate('nameTooLong')),
    email: string()
      .trim()
      .lowercase()
      .required(translate('emailRequired'))
      .email(translate('emailInvalid'))
      .max(254, translate('emailTooLong')),
    password: string()
      .required(translate('passwordRequired'))
      .min(8, translate('passwordTooShort'))
      .max(128, translate('passwordTooLong'))
      .matches(/[A-Z]/, translate('passwordUppercase'))
      .matches(/[0-9]/, translate('passwordDigit')),
    confirmPassword: string()
      .required(translate('confirmPasswordRequired'))
      .max(128, translate('passwordTooLong'))
      .oneOf([ref('password'), ''], translate('passwordMismatch')),
  });
}
