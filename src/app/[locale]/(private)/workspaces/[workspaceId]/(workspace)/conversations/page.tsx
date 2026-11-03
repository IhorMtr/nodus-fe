import { ConversationsView } from '@/views/workspaces/conversations-view/ConversationsView';

export default async function ConversationsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return <ConversationsView workspaceId={workspaceId} />;
}
