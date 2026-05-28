import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],

    // Helps prevent dev-time image crashes/timeouts
    minimumCacheTTL: 60,

    // More stable formats (avoids some Sharp edge cases)
    formats: ["image/avif", "image/webp"],
  },

  // Optional but useful during debugging image issues
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;