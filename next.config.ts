import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite dos `next dev` en paralelo (app1 + app2) con NEXT_DIST_DIR distinto.
  distDir: process.env.NEXT_DIST_DIR || ".next",
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
};

export default nextConfig;
