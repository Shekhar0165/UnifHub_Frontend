/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        turbopack: false,  // Disable Turbopack
    },
    output: 'standalone',  // Use standalone output for better optimization

    // Disable static generation and optimize for server rendering
    staticPageGenerationTimeout: 1000,
    
    // Runtime configuration
    reactStrictMode: true,
    swcMinify: true, 
    
    // Disable image optimization for deployment
    images: {
        unoptimized: true,
    },
    
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
