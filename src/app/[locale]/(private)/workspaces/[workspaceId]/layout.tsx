import type { ReactNode } from 'react';

import { PersonalSettingsSlot } from '@/views/workspaces/personal-settings-view/PersonalSettingsSlot';

export default async function WorkspaceLayout({
  children,
  settingsModal,
  params,
}: {
  children: ReactNode;
  settingsModal: ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return (
    <>
      {children}
      <PersonalSettingsSlot workspaceId={workspaceId}>
        {settingsModal}
      </PersonalSettingsSlot>
    </>
  );
}
