import type { ReactNode } from 'react';

import { AuthLayout } from '@/domains/auth/ui/auth-layout';

import { AuthEntryGuard } from './_guards/AuthEntryGuard';
import { AuthRoutePreview } from './_previews/AuthRoutePreview';

export default function AuthenticationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthEntryGuard>
      <AuthLayout preview={<AuthRoutePreview />}>{children}</AuthLayout>
    </AuthEntryGuard>
  );
}
