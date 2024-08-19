/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['@react-oauth/google'],  
  webpack: (config, { dev, isServer }) => {
    if (!isServer && dev) {
      config.devtool = 'source-map';
    }
    return config;
  },
};

export default nextConfig;
