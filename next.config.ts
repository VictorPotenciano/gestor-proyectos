import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  async redirects() {
    return [
      {
        source: "/",
        destination: "/proyectos",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
