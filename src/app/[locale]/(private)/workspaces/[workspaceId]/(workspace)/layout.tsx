import type { ReactNode } from 'react';

import { WorkspaceShell } from '@/widgets/workspace-shell';

export default async function WorkspaceScreenLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return <WorkspaceShell workspaceId={workspaceId}>{children}</WorkspaceShell>;
}
