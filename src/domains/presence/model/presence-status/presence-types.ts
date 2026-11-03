// ==================== TYPES ====================

export type PresenceStatus = 'online' | 'away' | 'dnd' | 'offline';

export type SelectablePresenceStatus = Exclude<PresenceStatus, 'offline'>;

export interface PresenceUpdate {
  userId: string;
  status: PresenceStatus;
}

// ==================== CONSTANTS ====================

export const selectablePresenceStatuses: readonly SelectablePresenceStatus[] = [
  'online',
  'away',
  'dnd',
];

const presenceStatuses: readonly PresenceStatus[] = [
  ...selectablePresenceStatuses,
  'offline',
];

// ==================== GUARDS ====================

export function isPresenceUpdate(payload: unknown): payload is PresenceUpdate {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const { userId, status } = payload as Record<string, unknown>;

  return (
    typeof userId === 'string' &&
    typeof status === 'string' &&
    presenceStatuses.includes(status as PresenceStatus)
  );
}
