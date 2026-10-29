import { MembersView } from '@/views/workspaces/members-view/MembersView';

export default async function MembersPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return <MembersView workspaceId={workspaceId} />;
}
