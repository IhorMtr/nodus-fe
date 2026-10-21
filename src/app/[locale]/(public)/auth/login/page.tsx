import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { LoginView } from '@/views/auth/login-view';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('user.actions');
  return { title: `${t('signIn')} | Nodus` };
}

export default function LoginPage() {
  return <LoginView />;
}
