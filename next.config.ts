import type { NextConfig } from "next";
import webpack from 'webpack';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Handle node: protocol imports
      config.resolve.alias = {
        ...config.resolve.alias,
        'node:async_hooks': false,
        'node:events': require.resolve('events/'),
        'node:fs': require.resolve('browserify-fs'),
        'node:path': require.resolve('path-browserify'),
        'node:process': require.resolve('process/browser'),
        'node:stream': require.resolve('stream-browserify'),
        'node:util': require.resolve('util/'),
      };
      
      // Client-side polyfills
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'async_hooks': false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        assert: require.resolve('assert/'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify'),
        url: require.resolve('url/'),
        buffer: require.resolve('buffer/'),
        fs: false,
        path: require.resolve('path-browserify'),
      };
      
      // Properly add plugins
      config.plugins = config.plugins || [];
      
      // Add Buffer and process polyfills
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );
    }
    
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['crypto'],
  },
  transpilePackages: ['langchain', '@langchain']
};

export default nextConfig;