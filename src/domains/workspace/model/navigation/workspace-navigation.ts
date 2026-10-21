// Only navigation identifiers are persisted; access is checked against API data.
function read(key: string): string | null {
  try {
    return typeof window === 'undefined'
      ? null
      : window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
  } catch {
    // Navigation still works when browser storage is unavailable.
  }
}

export const workspaceNavigation = {
  getLastWorkspaceId(userId: string): string | null {
    return read(`nodus:user:${userId}:last-workspace`);
  },
  setLastWorkspaceId(userId: string, workspaceId: string): void {
    write(`nodus:user:${userId}:last-workspace`, workspaceId);
  },
  getLastChannelId(userId: string, workspaceId: string): string | null {
    return read(`nodus:user:${userId}:workspace:${workspaceId}:last-channel`);
  },
  setLastChannelId(
    userId: string,
    workspaceId: string,
    channelId: string
  ): void {
    write(
      `nodus:user:${userId}:workspace:${workspaceId}:last-channel`,
      channelId
    );
  },
};
