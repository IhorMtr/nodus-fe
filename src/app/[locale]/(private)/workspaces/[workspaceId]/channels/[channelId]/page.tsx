import { ChannelView } from '@/views/workspaces/channels/channel-view';

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ workspaceId: string; channelId: string }>;
}) {
  const { workspaceId, channelId } = await params;
  return <ChannelView workspaceId={workspaceId} channelId={channelId} />;
}
