import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Handle node: protocol imports
      config.resolve.alias = {
        ...config.resolve.alias,
        'node:async_hooks': 'async_hooks-polyfill',
        'node:events': 'events/',
        'node:fs': 'browserify-fs',
        'node:path': 'path-browserify',
        'node:process': 'process/browser',
        'node:stream': 'stream-browserify',
        'node:util': 'util/',
      };
      
      // Client-side polyfills
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        assert: require.resolve('assert/'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify'),
        url: require.resolve('url/'),
      };
    }
    
    return config;
  },
};

export default nextConfig;
