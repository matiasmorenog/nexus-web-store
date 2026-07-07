"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function HomeHeroContent({ children }: { children: ReactNode }) {
  return (
    <div className={cn("relative z-10 mx-auto max-w-3xl px-4 text-center hero-content-enter")}>
      {children}
    </div>
  );
}
