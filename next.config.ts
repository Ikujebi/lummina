import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
   turbopack: {
    root: "C:/Users/Tochukwu/Documents/GitHub/lummina",
  },
};

export default nextConfig;