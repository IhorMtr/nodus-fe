'use client';

import { useWorkspacesQuery } from '@/domains/workspace/model/workspace';
import { useRouter } from '@/shared/i18n/navigation';

// ==================== WORKSPACE SWITCHER AND SEARCH ====================

export function useWorkspaceHeader(workspaceId: string) {
  const router = useRouter();
  const workspaces = useWorkspacesQuery();

  const openSearch = () => {
    router.push({
      pathname: '/workspaces/[workspaceId]/search',
      params: { workspaceId },
    });
  };

  const retryWorkspaces = () => {
    void workspaces.refetch();
  };

  return { workspaces, openSearch, retryWorkspaces };
}
