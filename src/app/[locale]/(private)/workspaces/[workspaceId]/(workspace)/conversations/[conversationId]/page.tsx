import { ConversationsView } from '@/views/workspaces/conversations-view/ConversationsView';

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ workspaceId: string; conversationId: string }>;
}) {
  const { workspaceId, conversationId } = await params;
  return (
    <ConversationsView
      workspaceId={workspaceId}
      conversationId={conversationId}
    />
  );
}
