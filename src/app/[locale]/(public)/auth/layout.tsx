import type { ReactNode } from 'react';

import { AuthLayout } from '@/domains/auth/ui/auth-layout';
import { AuthPreview } from '@/domains/auth/ui/auth-preview';
import { AppPreview } from '@/widgets/app-preview/AppPreview';

import { AuthEntryGuard } from './_guards/AuthEntryGuard';

export default function AuthenticationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthEntryGuard>
      <AuthLayout
        preview={
          <AuthPreview>
            <AppPreview />
          </AuthPreview>
        }
      >
        {children}
      </AuthLayout>
    </AuthEntryGuard>
  );
}
