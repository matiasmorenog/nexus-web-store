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
   * IntersectionObserver rootMargin. Positive bottom anticipates the
   * reveal before the block fully enters (avoids blank below-hero gaps).
   */
  rootMargin?: string;
  /** Fraction of the element that must be visible to trigger. */
  threshold?: number;
};

/** Backup after intersect if the stagger timer never fires. */
const REVEAL_FAILSAFE_MS = 400;
/** Near-viewport mount: never leave Destacados-style gaps blank. */
const NEAR_FAILSAFE_MS = 500;
/** Far off-screen last resort only. */
const FAR_FAILSAFE_MS = 12_000;
/** Extra px below the fold that still counts as "already near" on mount. */
const NEAR_VIEWPORT_PX = 160;

function isNearOrInViewport(node: HTMLElement, slackPx: number): boolean {
  const rect = node.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return rect.top < vh + slackPx && rect.bottom > -slackPx;
}

/**
 * Soft opacity + translateY reveal when the block scrolls into view.
 * Reuses `.page-reveal-*` CSS; respects `prefers-reduced-motion`.
 * Sections already (or almost) in view on mount reveal immediately.
 */
export function StorefrontReveal({
  children,
  index = 0,
  className,
  delayMs = 90,
  rootMargin = "0px 0px 160px 0px",
  threshold = 0,
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

    // Already on screen (or just under the fold) → reveal now.
    // Fixes blank band under hero when Destacados is partially in view.
    if (isNearOrInViewport(node, NEAR_VIEWPORT_PX)) {
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

    // IO initial callback can lag a frame; re-check after layout.
    const raf = window.requestAnimationFrame(() => {
      if (cancelled) return;
      if (isNearOrInViewport(node, NEAR_VIEWPORT_PX)) {
        observer.disconnect();
        activeObserver = null;
        scheduleReveal();
      }
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
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
        visible ? "page-reveal-enter" : "page-reveal-prep",
        className,
      )}
    >
      {children}
    </div>
  );
}
