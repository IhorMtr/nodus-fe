import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/shared/i18n/request.ts');

const nextConfig: NextConfig = {
  agentRules: false,
  sassOptions: {
    implementation: 'sass-embedded',
  },
};

export default withNextIntl(nextConfig);
