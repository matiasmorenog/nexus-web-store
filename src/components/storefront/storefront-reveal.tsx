"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type StorefrontRevealProps = {
  children: ReactNode;
  /** Stagger slot after the element enters the viewport (0 = immediate). */
  index?: number;
  className?: string;
  /** Delay between stagger slots once visible. */
  delayMs?: number;
  /**
   * IntersectionObserver rootMargin. Negative bottom pulls the trigger
   * slightly into the viewport so the fade reads as a scroll reveal.
   */
  rootMargin?: string;
  /** Fraction of the element that must be visible to trigger. */
  threshold?: number;
};

/** Backup after intersect if the stagger timer never fires. */
const REVEAL_FAILSAFE_MS = 1600;
/** Absolute last resort so content is never stuck invisible forever. */
const ABSOLUTE_FAILSAFE_MS = 12_000;

/**
 * Soft opacity + translateY reveal when the block scrolls into view.
 * Reuses `.page-reveal-*` CSS; respects `prefers-reduced-motion`.
 */
export function StorefrontReveal({
  children,
  index = 0,
  className,
  delayMs = 90,
  rootMargin = "0px 0px -10% 0px",
  threshold = 0.12,
}: StorefrontRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let cancelled = false;
    let delayTimer: number | undefined;
    let intersectFailsafe: number | undefined;

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

    const staggerMs = Math.max(0, index * delayMs);
    const absoluteFailsafe = window.setTimeout(show, ABSOLUTE_FAILSAFE_MS);

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        delayTimer = window.setTimeout(show, staggerMs);
        intersectFailsafe = window.setTimeout(
          show,
          staggerMs + REVEAL_FAILSAFE_MS,
        );
      },
      { rootMargin, threshold },
    );

    observer.observe(node);

    return () => {
      cancelled = true;
      observer.disconnect();
      window.clearTimeout(absoluteFailsafe);
      if (delayTimer !== undefined) window.clearTimeout(delayTimer);
      if (intersectFailsafe !== undefined) {
        window.clearTimeout(intersectFailsafe);
      }
    };
  }, [index, delayMs, rootMargin, threshold]);

  return (
    <div
      ref={ref}
      className={cn(
        visible ? "page-reveal-enter" : "page-reveal-prep",
        className,
      )}
    >
      {children}
    </div>
  );
}
