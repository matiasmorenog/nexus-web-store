"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type StorefrontRevealProps = {
  children: ReactNode;
  /** Stagger slot after the element enters the viewport (0 = immediate). */
  index?: number;
  className?: string;
  /** Delay between stagger slots once visible. Soft grid cascade. */
  delayMs?: number;
  /** IntersectionObserver rootMargin — keep tight; do not anticipate far. */
  rootMargin?: string;
  /** Fraction of the element that must be visible to trigger (~15–25%). */
  threshold?: number;
};

/** Backup after intersect if the stagger timer never fires. */
const REVEAL_FAILSAFE_MS = 500;
/** Mount path: Destacados-style gaps must not stay blank. */
const NEAR_FAILSAFE_MS = 600;
/** Far off-screen last resort only. */
const FAR_FAILSAFE_MS = 12_000;

/** True only when any part of the node is clearly inside the viewport (no slack). */
function isClearlyIntersecting(node: HTMLElement): boolean {
  const rect = node.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return rect.top < vh && rect.bottom > 0 && rect.top < rect.bottom;
}

/**
 * Soft opacity + translateY reveal on scroll.
 * Above-fold / clearly intersecting on mount → reveal now (no blank gap).
 * Below-fold → wait until ~20% is visible (no eager rootMargin).
 */
export function StorefrontReveal({
  children,
  index = 0,
  className,
  delayMs = 75,
  rootMargin = "0px",
  threshold = 0.2,
}: StorefrontRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let cancelled = false;
    let delayTimer: number | undefined;
    let intersectFailsafe: number | undefined;
    let activeObserver: IntersectionObserver | null = null;

    const clearRevealTimers = () => {
      if (delayTimer !== undefined) {
        window.clearTimeout(delayTimer);
        delayTimer = undefined;
      }
      if (intersectFailsafe !== undefined) {
        window.clearTimeout(intersectFailsafe);
        intersectFailsafe = undefined;
      }
    };

    const show = () => {
      if (cancelled) return;
      setVisible(true);
      activeObserver?.disconnect();
      activeObserver = null;
      clearRevealTimers();
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

    // Clearly in viewport on mount → reveal now (keeps Destacados visible).
    // No positive slack: sections fully below the fold wait for scroll IO.
    if (isClearlyIntersecting(node)) {
      const staggerMs = Math.max(0, Math.min(index, 2) * delayMs);
      if (staggerMs === 0) {
        show();
      } else {
        delayTimer = window.setTimeout(show, staggerMs);
      }
      const nearFailsafe = window.setTimeout(show, NEAR_FAILSAFE_MS);
      return () => {
        cancelled = true;
        window.clearTimeout(nearFailsafe);
        clearRevealTimers();
      };
    }

    const staggerMs = Math.max(0, index * delayMs);
    const farFailsafe = window.setTimeout(show, FAR_FAILSAFE_MS);

    const scheduleReveal = () => {
      clearRevealTimers();
      delayTimer = window.setTimeout(show, staggerMs);
      intersectFailsafe = window.setTimeout(
        show,
        staggerMs + REVEAL_FAILSAFE_MS,
      );
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        activeObserver = null;
        scheduleReveal();
      },
      { rootMargin, threshold },
    );
    activeObserver = observer;
    observer.observe(node);

    return () => {
      cancelled = true;
      observer.disconnect();
      activeObserver = null;
      window.clearTimeout(farFailsafe);
      clearRevealTimers();
    };
  }, [index, delayMs, rootMargin, threshold]);

  return (
    <div
      ref={ref}
      className={cn(
        visible ? "storefront-reveal-enter" : "storefront-reveal-prep",
        className,
      )}
    >
      {children}
    </div>
  );
}
