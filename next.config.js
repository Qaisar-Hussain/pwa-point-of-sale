const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  sw: 'sw.js',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'next-auth/css': false,
    };
    
    // Exclude next-auth CSS from being processed
    config.module.rules.push({
      test: /node_modules\/next-auth\/css\/index\.js$/,
      use: 'null-loader',
    });

    return config;
  },
};

module.exports = withPWA(nextConfig);
