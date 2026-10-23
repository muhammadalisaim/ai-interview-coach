/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Prevents double mic init in dev mode
  images: {
    domains: ["images.unsplash.com", "avatar.vercel.sh"],
  },
};

export default nextConfig;
