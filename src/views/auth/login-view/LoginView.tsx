'use client';

import { useTranslations } from 'next-intl';

import { AuthContent } from '@/domains/auth/ui/auth-content';
import { LoginForm } from '@/domains/auth/ui/login-form';
import { Link } from '@/shared/i18n/navigation';

import { useLoginView } from './hooks/use-login-view';

export function LoginView() {
  const form = useLoginView();
  const experience = useTranslations('auth.experience');
  const user = useTranslations('user.actions');

  return (
    <AuthContent
      headingId="sign-in-title"
      title={experience('signInTitle')}
      description={experience('signInDescription')}
      footer={
        <>
          <span>{experience('noAccount')}</span>
          <Link href="/auth/register">{user('signUp')}</Link>
        </>
      }
    >
      <LoginForm {...form} />
    </AuthContent>
  );
}
