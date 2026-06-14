"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageRevealProps = {
  children: ReactNode;
  index?: number;
  className?: string;
  delayMs?: number;
};

export function PageReveal({
  children,
  index = 0,
  className,
  delayMs = 100,
}: PageRevealProps) {
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
    }, index * delayMs);

    return () => window.clearTimeout(timeout);
  }, [index, delayMs]);

  return (
    <div
      className={cn(
        visible ? "page-reveal-enter" : "page-reveal-prep",
        className,
      )}
    >
      {children}
    </div>
  );
}
