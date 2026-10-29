// Enable locally with NEXT_PUBLIC_SOCKET_DEBUG=true. Never log event bodies or credentials.
export const realtimeDebug = process.env.NEXT_PUBLIC_SOCKET_DEBUG === 'true';

export function logRealtime(event: string, details: Record<string, unknown>) {
  if (realtimeDebug) {
    console.debug(event, details);
  }
}
