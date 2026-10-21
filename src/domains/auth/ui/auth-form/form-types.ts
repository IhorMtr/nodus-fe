import type { FormEventHandler } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

export type AuthFieldProps = UseFormRegisterReturn & {
  error?: string;
};

export type AuthFormProps = {
  onSubmit: FormEventHandler<HTMLFormElement>;
  isSubmitting: boolean;
  formError?: string;
};
