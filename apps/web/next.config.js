import './src/env.js';

/** @type {import("next").NextConfig} */
const config = {
  transpilePackages: ['three'],
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
