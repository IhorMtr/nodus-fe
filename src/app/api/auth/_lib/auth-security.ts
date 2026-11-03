import 'server-only';

import type { NextRequest } from 'next/server';

export function hasTrustedAuthOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');

  if (!origin || origin === 'null') {
    return false;
  }

  if (request.headers.get('sec-fetch-site') !== 'same-origin') {
    return false;
  }

  try {
    const applicationUrl = new URL(request.nextUrl.origin);

    if (!['http:', 'https:'].includes(applicationUrl.protocol)) {
      return false;
    }

    return origin === applicationUrl.origin;
  } catch {
    return false;
  }
}
