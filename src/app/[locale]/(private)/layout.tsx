import type { ReactNode } from 'react';

import { AuthSessionProvider } from './_providers/AuthSessionProvider';

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return <AuthSessionProvider>{children}</AuthSessionProvider>;
}
