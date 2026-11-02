import { Suspense } from 'react';

import { AnnouncementsView } from '@/views/workspaces/announcements-view/AnnouncementsView';

export default async function AnnouncementsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return (
    <Suspense>
      <AnnouncementsView workspaceId={workspaceId} />
    </Suspense>
  );
}
