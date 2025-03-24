/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        turbopack: false,  // Disable Turbopack
    },
    output: 'standalone',  // Use standalone output for better optimization
    // Define routes that require client-side execution
    // These won't be prerendered statically
    async redirects() {
        return [];
    },
    async headers() {
        return [];
    },
};

export default nextConfig;
