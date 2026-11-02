import { SettingsView } from '@/views/workspaces/settings-view/SettingsView';

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return <SettingsView workspaceId={workspaceId} />;
}
