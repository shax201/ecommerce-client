/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  eslint: {
    dirs: ["pages", "components", "lib", "app"],
  },
  // ISR Configuration
  serverExternalPackages: ["next/cache"],
  // Enable ISR caching with stable build ID
  generateBuildId: async () => {
    // Use a stable build ID for consistent ISR caching
    return "isr-build-" + process.env.NODE_ENV;
  },
};

export default nextConfig;
