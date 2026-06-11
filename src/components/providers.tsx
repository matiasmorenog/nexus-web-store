"use client";

import { SessionProvider } from "next-auth/react";
import { Suspense } from "react";
import { RouteLoadingOverlay } from "@/components/route-loading-overlay";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Suspense fallback={null}>
        <RouteLoadingOverlay />
      </Suspense>
      {children}
    </SessionProvider>
  );
}
