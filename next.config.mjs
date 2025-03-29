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
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "http://localhost:3000" }, // Allow frontend to access backend
                    { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Authorization, Content-Type, Set-Cookie" },
                ],
            },
        ];
    },
};

export default nextConfig;
