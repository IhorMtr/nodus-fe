export interface Workspace {
  id: string;
  name: string;
  role: 'Owner' | 'Admin' | 'Member';
  createdAt: string;
  updatedAt: string;
}
