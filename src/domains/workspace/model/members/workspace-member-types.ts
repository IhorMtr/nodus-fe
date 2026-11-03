import type { PresenceStatus } from '@/domains/presence/model/presence-status';

export interface WorkspaceMember {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Member';
  joinedAt: string;
  status: PresenceStatus;
}
