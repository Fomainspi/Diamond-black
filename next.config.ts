import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  // Prisma's generated client and PostgreSQL adapter are runtime dependencies
  // of the event-registration route. Include them explicitly in standalone output.
  outputFileTracingIncludes: {
    "/api/events/register": [
      "./src/generated/prisma/**/*",
      "./node_modules/@prisma/**/*",
      "./node_modules/pg/**/*"
    ]
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  }
};

export default nextConfig;
