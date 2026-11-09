import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const apiOrigin = new URL(apiUrl).origin;
const wsOrigin = apiOrigin.replace(/^http/, "ws");
// Origin that serves sign videos (CDN / S3), if different from the API.
const mediaOrigin = process.env.NEXT_PUBLIC_MEDIA_ORIGIN
  ? new URL(process.env.NEXT_PUBLIC_MEDIA_ORIGIN).origin
  : "";

// Content-Security-Policy: only our own origin plus the API. 'unsafe-inline'
// for scripts is required by the pre-paint theme script and Next's inline
// bootstrap; 'unsafe-eval' only in development (React Refresh).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self' ${apiOrigin} ${wsOrigin}`,
  `media-src 'self' blob: ${apiOrigin} ${mediaOrigin}`.trim(),
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Camera/microphone only for our own origin, and only after an explicit user action.
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(self), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
