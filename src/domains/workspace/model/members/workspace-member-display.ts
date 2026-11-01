import type { WorkspaceMember } from './workspace-member-types';

// ==================== DISPLAY NAME ====================

// Profiles without a first and last name fall back to the email address.
export function getWorkspaceMemberName(member: WorkspaceMember): string {
  return `${member.firstName} ${member.lastName}`.trim() || member.email;
}

// ==================== INITIALS ====================

export function getWorkspaceMemberInitials(member: WorkspaceMember): string {
  const initials = `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`;

  return (initials || member.email.charAt(0)).toUpperCase();
}
