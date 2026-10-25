import { Search } from 'lucide-react';

import { WorkspaceSection } from '@/widgets/workspace-shell/components/WorkspaceSection';

export function SearchView() {
  return <WorkspaceSection section="search" icon={<Search />} />;
}
