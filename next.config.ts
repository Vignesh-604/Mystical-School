import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Microphone for the voice guide; camera and mic for the embedded video guide.
  { key: "Permissions-Policy", value: "camera=(self \"https://tavus.daily.co\"), microphone=(self \"https://tavus.daily.co\"), geolocation=()" },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
