export interface WorkspaceMember {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Member';
  joinedAt: string;
}
