import './src/env.js';

/** @type {import("next").NextConfig} */
const config = {
  transpilePackages: ['three', '@repo/ecctrl'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'p8rfhqflvw.ufs.sh',
      },
    ],
  },
};

export default config;
