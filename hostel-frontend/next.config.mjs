/** @type {import('next').NextConfig} */
const nextConfig = {
  // Expose env variables to the browser (NEXT_PUBLIC_ prefix does this automatically,
  // but listing them here makes them explicit and avoids build-time surprises)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Allow external image domains used in the app (e.g. DiceBear avatars)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
  },
};

export default nextConfig;
