'use client';

import { useTranslations } from 'next-intl';

import { AuthContent } from '@/domains/auth/ui/auth-content';
import { RegisterForm } from '@/domains/auth/ui/register-form';
import { Link } from '@/shared/i18n/navigation';

import { useRegisterView } from './hooks/use-register-view';

export function RegisterView() {
  const form = useRegisterView();
  const experience = useTranslations('auth.experience');
  const user = useTranslations('user.actions');

  return (
    <AuthContent
      headingId="registration-title"
      title={experience('registrationTitle')}
      description={experience('registrationDescription')}
      footer={
        <>
          <span>{experience('hasAccount')}</span>
          <Link href="/auth/login">{user('signIn')}</Link>
        </>
      }
    >
      <RegisterForm {...form} />
    </AuthContent>
  );
}
