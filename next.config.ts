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
  // experimental bloğu Next 15+ için kaldırıldı
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
};

export default withSentryConfig(nextConfig, {
  org: "ogretmen-busra",
  project: "ogretmen-busra-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  // Yeni Sentry (v8+) Sourcemap ayarları
  sourcemaps: {
    disable: false, // Eğer kaynak kod haritalarının (sourcemaps) tarayıcıya gitmesini istemiyorsanız true yapabilirsiniz
  },
  disableLogger: true,
  automaticVercelMonitors: true,
});