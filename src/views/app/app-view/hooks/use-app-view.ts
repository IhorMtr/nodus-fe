'use client';

import { useEffect } from 'react';

import { useCurrentUserQuery } from '@/domains/user/model/current-user';
import { workspaceNavigation } from '@/domains/workspace/model/navigation';
import { useWorkspacesQuery } from '@/domains/workspace/model/workspace';
import { useRouter } from '@/shared/i18n/navigation';

// ==================== PAGE STATE ====================

export function useAppView() {
  // ==================== QUERIES ====================

  const router = useRouter();
  const user = useCurrentUserQuery();
  const workspaces = useWorkspacesQuery({
    enabled: user.isSuccess && user.isFetchedAfterMount && !user.isFetching,
  });
  const error = user.error ?? workspaces.error;
  const isFetching = user.isFetching || workspaces.isFetching;

  // ==================== ROUTE RESOLUTION ====================

  useEffect(() => {
    if (
      !user.isSuccess ||
      !user.isFetchedAfterMount ||
      !workspaces.isSuccess ||
      !workspaces.isFetchedAfterMount ||
      isFetching
    ) {
      return;
    }

    const savedId = workspaceNavigation.getLastWorkspaceId(user.data.id);
    const workspace =
      workspaces.data.find(item => item.id === savedId) ?? workspaces.data[0];

    if (!workspace) {
      router.replace('/workspaces/new');
      return;
    }

    workspaceNavigation.setLastWorkspaceId(user.data.id, workspace.id);
    router.replace({
      pathname: '/workspaces/[workspaceId]',
      params: { workspaceId: workspace.id },
    });
  }, [
    user.isSuccess,
    user.isFetchedAfterMount,
    user.data,
    workspaces.isSuccess,
    workspaces.isFetchedAfterMount,
    workspaces.data,
    isFetching,
    router,
  ]);

  // ==================== RECOVERY ====================

  const retry = () => {
    if (user.isError) {
      void user.refetch();
    } else {
      void workspaces.refetch();
    }
  };

  return { error, isFetching, retry };
}
