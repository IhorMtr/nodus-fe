'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

import type { AuthFieldProps, AuthFormProps } from '../auth-form';
import styles from './RegisterForm.module.scss';

// ==================== FORM CONTRACT ====================

export type RegisterFormProps = AuthFormProps & {
  fields: {
    firstName: AuthFieldProps;
    lastName: AuthFieldProps;
    email: AuthFieldProps;
    password: AuthFieldProps;
    confirmPassword: AuthFieldProps;
  };
};

// ==================== FORM ====================

export function RegisterForm({
  fields,
  onSubmit,
  isSubmitting,
  formError,
}: RegisterFormProps) {
  const user = useTranslations('user');

  return (
    <form
      className={styles.form}
      onSubmit={onSubmit}
      noValidate
      aria-busy={isSubmitting}
    >
      <Input
        {...fields.firstName}
        id="register-first-name"
        label={user('fields.firstName')}
        autoComplete="given-name"
        readOnly={isSubmitting}
        required
      />
      <Input
        {...fields.lastName}
        id="register-last-name"
        label={user('fields.lastName')}
        autoComplete="family-name"
        readOnly={isSubmitting}
        required
      />
      <Input
        {...fields.email}
        id="register-email"
        type="email"
        label={user('fields.email')}
        autoComplete="email"
        inputMode="email"
        autoCapitalize="none"
        spellCheck={false}
        readOnly={isSubmitting}
        required
      />
      <Input
        {...fields.password}
        id="register-password"
        type="password"
        label={user('fields.password')}
        autoComplete="new-password"
        showPasswordToggle
        readOnly={isSubmitting}
        required
      />
      <Input
        {...fields.confirmPassword}
        id="register-confirm-password"
        type="password"
        label={user('fields.confirmPassword')}
        autoComplete="new-password"
        showPasswordToggle
        readOnly={isSubmitting}
        required
      />
      {formError && (
        <p className={styles.error} role="alert">
          {formError}
        </p>
      )}
      <Button
        className={styles.submit}
        type="submit"
        fullWidth
        loading={isSubmitting}
        disabled={isSubmitting}
      >
        {user('actions.createAccount')}
      </Button>
    </form>
  );
}
