import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { RegisterView } from '@/views/auth/register-view';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('user.actions');
  return { title: `${t('createAccount')} | Nodus` };
}

export default function RegisterPage() {
  return <RegisterView />;
}
