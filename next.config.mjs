/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            allowedOrigins: [
                "localhost:3000", // Local
                "https://qr7wttr8-3000.usw3.devtunnels.ms/", // Tunnel
                "https://my-youtube-to-mp3.vercel.app/",
                "http://177.234.241.25:999", // Deployment Vercel
            ],
        },
    },
};

export default nextConfig;
