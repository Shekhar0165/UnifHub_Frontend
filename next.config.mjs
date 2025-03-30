/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',  // Use standalone output for better optimization
    staticPageGenerationTimeout: 1000,  // Timeout for static page generation

    // Enable React strict mode
    reactStrictMode: true,

    // Disable image optimization for deployment
    images: {
        unoptimized: true,
    },

    // Define custom headers correctly
    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    {
                        key: "Access-Control-Allow-Origin",
                        value: "*",  // Allow all origins (Modify for security)
                    },
                    {
                        key: "Access-Control-Allow-Methods",
                        value: "GET,POST,PUT,DELETE,OPTIONS",
                    },
                    {
                        key: "Access-Control-Allow-Headers",
                        value: "Content-Type, Authorization",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
