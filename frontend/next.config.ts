// next.config.js
const path = require('path');

/** @type {import('next').NextConfig} */
module.exports = {
  experimental: { appDir: true },
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'app'),
      '@components': path.resolve(__dirname, 'components'),
    };
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgo: true,
            svgoConfig: {
              plugins: [
                { name: 'removeViewBox', active: false },
                { name: 'removeDimensions', active: true },
              ],
            },
          },
        },
      ],
    });

    return config;
  },
};
