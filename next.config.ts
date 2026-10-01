import type { NextConfig } from "next";
import {
  isManovivaDeployEnv,
  STOREFRONT_ROUTE_ALIASES,
} from "./src/lib/storefront-route-aliases";

const nextConfig: NextConfig = {
  // Permite varios `next dev` en paralelo (app1/app2/app3) con NEXT_DIST_DIR distinto.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Turbopack's trace misses libvips (loaded via dlopen), so sharp fails on Vercel without it.
  outputFileTracingIncludes: {
    "/api/admin/upload": [
      "./node_modules/@img/sharp-linux-x64/**/*",
      "./node_modules/@img/sharp-libvips-linux-x64/**/*",
    ],
  },
  experimental: {
    // Neon usa un pool mínimo en este proyecto. Serializar el prerender evita
    // que varios workers agoten su única conexión durante `next build`.
    staticGenerationRetryCount: 2,
    staticGenerationMaxConcurrency: 1,
    staticGenerationMinPagesPerWorker: 1000,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  async rewrites() {
    if (!isManovivaDeployEnv()) return [];
    return STOREFRONT_ROUTE_ALIASES.map(({ source, destination }) => ({
      source,
      destination,
    }));
  },
};

export default nextConfig;
