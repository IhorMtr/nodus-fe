import type { NextRequest } from 'next/server';

import { authProxy } from '../_lib/auth-proxy';

export const runtime = 'nodejs';

export function POST(request: NextRequest) {
  return authProxy.logout(request);
}
