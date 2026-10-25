import { MessagesSquare } from 'lucide-react';

import { WorkspaceSection } from '@/widgets/workspace-shell/components/WorkspaceSection';

export function ConversationsView() {
  return <WorkspaceSection section="conversations" icon={<MessagesSquare />} />;
}
