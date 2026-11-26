"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageRevealProps = {
  children: ReactNode;
  index?: number;
  className?: string;
  delayMs?: number;
};

/** Never leave content stuck at opacity 0 if timers/rAF stall. */
const REVEAL_FAILSAFE_MS = 1600;

export function PageReveal({
  children,
  index = 0,
  className,
  delayMs = 100,
}: PageRevealProps) {
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    let cancelled = false;
    const show = () => {
      if (!cancelled) setVisible(true);
    };

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      show();
      return () => {
        cancelled = true;
      };
    }

    const delay = Math.max(0, index * delayMs);
    const timeout = window.setTimeout(show, delay);
    const failsafe = window.setTimeout(show, delay + REVEAL_FAILSAFE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      window.clearTimeout(failsafe);
    };
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
