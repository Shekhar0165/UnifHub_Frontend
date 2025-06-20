/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    staticPageGenerationTimeout: 1000,
    reactStrictMode: true,
    images: {
        unoptimized: true,
    },

    // REMOVED headers section entirely
    // Let your backend API handle CORS properly
    // This prevents conflicts and cookie issues
};

export default nextConfig;