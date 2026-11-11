"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminAnimatedMetricBarProps = {
  index: number;
  /** Target width 0–100. */
  widthPercent: number;
  /** Track height classes. Default matches dashboard top products. */
  trackClassName?: string;
  barClassName?: string;
};

/**
 * Same stagger + width transition as dashboard Top productos
 * (`admin-top-product-bar-enter`).
 */
export function AdminAnimatedMetricBar({
  index,
  widthPercent,
  trackClassName,
  barClassName,
}: AdminAnimatedMetricBarProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      const frame = requestAnimationFrame(() => setReady(true));
      return () => cancelAnimationFrame(frame);
    }

    const timeout = window.setTimeout(() => {
      requestAnimationFrame(() => setReady(true));
    }, 280 + index * 90);

    return () => window.clearTimeout(timeout);
  }, [index]);

  const width = Math.max(widthPercent, widthPercent > 0 ? 6 : 0);

  return (
    <div
      className={cn(
        "h-2 overflow-hidden rounded-full bg-neutral-100",
        trackClassName,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[color-mix(in_srgb,var(--brand-primary)_72%,white)]",
          ready ? "admin-top-product-bar-enter" : "w-0",
          barClassName,
        )}
        style={{ width: ready ? `${width}%` : undefined }}
      />
    </div>
  );
}

type AdminAnimatedMetricRowProps = {
  index: number;
  children: ReactNode;
  className?: string;
};

/** Row enter (slide/fade) matching dashboard top products list. */
export function AdminAnimatedMetricRow({
  index,
  children,
  className,
}: AdminAnimatedMetricRowProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      const frame = requestAnimationFrame(() => setReady(true));
      return () => cancelAnimationFrame(frame);
    }

    const timeout = window.setTimeout(() => {
      requestAnimationFrame(() => setReady(true));
    }, 280 + index * 90);

    return () => window.clearTimeout(timeout);
  }, [index]);

  return (
    <li
      className={cn(
        ready ? "admin-top-product-enter" : "admin-top-product-prep",
        className,
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {children}
    </li>
  );
}
