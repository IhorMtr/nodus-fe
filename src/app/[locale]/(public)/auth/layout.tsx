import type { ReactNode } from 'react';

import { AuthLayout } from '@/domains/auth/ui/auth-layout';

import { AuthEntryGuard } from './_guards/AuthEntryGuard';

export default function AuthenticationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthEntryGuard>
      <AuthLayout>{children}</AuthLayout>
    </AuthEntryGuard>
  );
}
