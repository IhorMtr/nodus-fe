// ==================== WORKSPACE ====================

export interface Workspace {
  id: string;
  name: string;
  role: 'Owner' | 'Admin' | 'Member';
  createdAt: string;
  updatedAt: string;
}

// ==================== METRICS ====================

export interface WorkspaceActivity {
  since: string;
  messages: number;
  directMessages: number;
  announcements: number;
  activeMembers: number;
}

export interface WorkspaceMetrics {
  generatedAt: string;
  totals: {
    members: number;
    channels: number;
    messages: number;
    directMessages: number;
    announcements: number;
    publishedAnnouncements: number;
  };
  activity: {
    last7Days: WorkspaceActivity;
    last30Days: WorkspaceActivity;
  };
}

// ==================== PERMISSIONS ====================

export function canViewWorkspaceMetrics(role: Workspace['role'] | undefined) {
  return role === 'Owner' || role === 'Admin';
}
