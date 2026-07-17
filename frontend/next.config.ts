import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    // @ts-ignore
    appIsrStatus: false,
  },
  // @ts-ignore - allowedDevOrigins is supported in Next.js 15+ dev configurations
  allowedDevOrigins: ['long-windows-enter.loca.lt', '*.loca.lt'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
