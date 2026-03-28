import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Permanent redirect: anyone who hits /login goes to /auth
      // This is a 308 (permanent) redirect so browsers and crawlers update their links
      {
        source: "/login",
        destination: "/auth",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
