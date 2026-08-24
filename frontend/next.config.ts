import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:5001/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
