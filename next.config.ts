import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  agentRules: false,
  sassOptions: {
    implementation: 'sass-embedded',
  },
};

export default nextConfig;
