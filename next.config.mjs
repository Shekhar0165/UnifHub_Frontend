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

    // CORS and Headers to allow cookies
    async headers() {
        return [
            {
                source: "/:path*",
            },
        ];
    },
};

export default nextConfig;
