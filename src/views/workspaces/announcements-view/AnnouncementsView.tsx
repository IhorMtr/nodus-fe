import { Megaphone } from 'lucide-react';

import { WorkspaceSection } from '@/widgets/workspace-shell/components/WorkspaceSection';

export function AnnouncementsView() {
  return <WorkspaceSection section="announcements" icon={<Megaphone />} />;
}
