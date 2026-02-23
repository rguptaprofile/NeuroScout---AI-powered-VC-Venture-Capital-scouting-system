/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Netlify configuration for serverless functions
  ...(process.env.NETLIFY && {
    experimental: {
      isrMemoryCacheSize: 0,
    },
  }),
};

export default nextConfig;
