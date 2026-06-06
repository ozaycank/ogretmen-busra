import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    // Enables modern, smaller image formats for faster loading
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        // Strictly bound to your custom domain. Do NOT use wildcards here.
        hostname: "r2.ogretmenbusra.com",
        pathname: "/**",
      }
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: "ogretmen-busra",
  project: "ogretmen-busra-nextjs",

  // Vercel / CI ortamında logları sessize al
  silent: !process.env.CI,
  widenClientFileUpload: true,

  sourcemaps: {
    disable: false, // Sentry'e sourcemap yüklenmesini sağlar (Hata takibi için gereklidir)
  }
});