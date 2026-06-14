"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminDashboardRevealProps = {
  children: ReactNode;
  index?: number;
  className?: string;
};

const SECTION_DELAY_MS = 110;

export function AdminDashboardReveal({
  children,
  index = 0,
  className,
}: AdminDashboardRevealProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    const timeout = window.setTimeout(() => {
      requestAnimationFrame(() => setVisible(true));
    }, index * SECTION_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [index]);

  return (
    <div
      className={cn(
        visible ? "admin-dashboard-reveal-enter" : "admin-dashboard-reveal-prep",
        className,
      )}
    >
      {children}
    </div>
  );
}
