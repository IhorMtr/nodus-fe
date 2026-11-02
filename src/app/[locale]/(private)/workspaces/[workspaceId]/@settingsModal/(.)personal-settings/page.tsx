import { PersonalSettingsModal } from '@/views/workspaces/personal-settings-view/PersonalSettingsModal';

export default async function InterceptedPersonalSettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return <PersonalSettingsModal workspaceId={workspaceId} />;
}
