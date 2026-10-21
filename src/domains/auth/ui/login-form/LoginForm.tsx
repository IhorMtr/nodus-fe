'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

import type { AuthFieldProps, AuthFormProps } from '../auth-form';
import styles from './LoginForm.module.scss';

// ==================== FORM CONTRACT ====================

export type LoginFormProps = AuthFormProps & {
  fields: {
    email: AuthFieldProps;
    password: AuthFieldProps;
  };
};

// ==================== FORM ====================

export function LoginForm({
  fields,
  onSubmit,
  isSubmitting,
  formError,
}: LoginFormProps) {
  const user = useTranslations('user');

  return (
    <form
      className={styles.form}
      onSubmit={onSubmit}
      noValidate
      aria-busy={isSubmitting}
    >
      <Input
        {...fields.email}
        id="login-email"
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
        id="login-password"
        type="password"
        label={user('fields.password')}
        autoComplete="current-password"
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
        {user('actions.signIn')}
      </Button>
    </form>
  );
}
