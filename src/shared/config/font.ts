import { IBM_Plex_Sans } from 'next/font/google';

export const appFont = IBM_Plex_Sans({
  weight: 'variable',
  subsets: ['latin', 'cyrillic'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
});
