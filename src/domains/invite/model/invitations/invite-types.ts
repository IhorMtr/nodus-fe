export interface WorkspaceInvite {
  id: string;
  workspaceId: string;
  createdById: string;
  expiresAt: string;
  usedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  status: 'active' | 'used' | 'revoked' | 'expired';
}

export interface CreatedInvite extends WorkspaceInvite {
  token: string;
}

export interface ResolvedInvite {
  id: string;
  name: string;
  expiresAt: string;
}

export interface AcceptedInvite {
  workspaceId: string;
  role: 'Member';
}
