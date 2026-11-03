import type { ReactNode } from 'react';

import { AuthLayout } from '@/domains/auth/ui/auth-layout';
import { AuthPreview } from '@/domains/auth/ui/auth-preview';
import { WorkspacePreview } from '@/widgets/workspace-preview/WorkspacePreview';

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
            <WorkspacePreview />
          </AuthPreview>
        }
      >
        {children}
      </AuthLayout>
    </AuthEntryGuard>
  );
}
