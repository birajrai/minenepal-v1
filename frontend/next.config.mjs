/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'render.crafty.gg',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'heart.minenepal.xyz',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'placehold.co',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'news.minenepal.xyz',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'minotar.net',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'mc-heads.net',
                pathname: '/**',
            },
        ],
        // Image optimization settings
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60,
    },
    // Optimize builds
    compress: true,
    poweredByHeader: false, // Remove X-Powered-By header for security
    reactStrictMode: true,
};

export default nextConfig;