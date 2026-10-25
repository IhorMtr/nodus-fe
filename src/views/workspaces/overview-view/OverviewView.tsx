import { LayoutDashboard } from 'lucide-react';

import { WorkspaceSection } from '@/widgets/workspace-shell/components/WorkspaceSection';

export function OverviewView() {
  return <WorkspaceSection section="overview" icon={<LayoutDashboard />} />;
}
