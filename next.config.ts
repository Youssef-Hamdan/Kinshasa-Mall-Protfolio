import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  allowedDevOrigins: ['192.168.3.135'],
  async rewrites() {
    return [
      {
        source: "/images/logo/logo1.webp",
        destination: "/images/logo.webp",
      },
      {
        source: "/images/logo/logo2.webp",
        destination: "/images/logo.webp",
      },
    ];
  },
};

export default nextConfig;
