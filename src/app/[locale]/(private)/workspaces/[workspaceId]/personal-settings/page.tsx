import { PersonalSettingsStandalone } from '@/views/workspaces/personal-settings-view/PersonalSettingsStandalone';

export default async function PersonalSettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return <PersonalSettingsStandalone workspaceId={workspaceId} />;
}
