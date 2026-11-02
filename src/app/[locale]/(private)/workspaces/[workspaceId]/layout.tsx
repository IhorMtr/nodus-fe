import type { ReactNode } from 'react';

export default function WorkspaceLayout({
  children,
  settingsModal,
}: {
  children: ReactNode;
  settingsModal: ReactNode;
}) {
  return (
    <>
      {children}
      {settingsModal}
    </>
  );
}
