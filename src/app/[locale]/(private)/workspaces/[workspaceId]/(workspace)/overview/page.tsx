import { OverviewView } from '@/views/workspaces/overview-view/OverviewView';

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return <OverviewView workspaceId={workspaceId} />;
}
