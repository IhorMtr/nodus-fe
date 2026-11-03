// ==================== INITIALS ====================

export function getNameInitials(name: string) {
  const [first = '', second = ''] = name.trim().split(/\s+/);

  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
}
