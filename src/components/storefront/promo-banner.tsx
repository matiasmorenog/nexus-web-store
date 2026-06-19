"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useEffect, useLayoutEffect, useState } from "react";
import { promoBanner, promoBannerDismissKey } from "@/lib/promo-banner";
import { cn } from "@/lib/utils";

const PROMO_BANNER_EXIT_MS = 280;

function readDismissed() {
  try {
    return sessionStorage.getItem(promoBannerDismissKey()) === "1";
  } catch {
    return false;
  }
}

function itemMotionClass(
  entered: boolean,
  closing: boolean,
  delay: 1 | 2 | 3 | 4,
) {
  if (closing) return undefined;

  return cn(
    entered ? "promo-banner-item-enter" : "promo-banner-item-prep",
    entered && `promo-banner-item-delay-${delay}`,
  );
}

type PromoBannerProps = {
  onActiveChange?: (active: boolean) => void;
};

export function PromoBanner({ onActiveChange }: PromoBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [entered, setEntered] = useState(false);
  const [closing, setClosing] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useLayoutEffect(() => {
    const wasDismissed = readDismissed();
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    setDismissed(wasDismissed);
    setReduceMotion(prefersReducedMotion);
    setHydrated(true);
    onActiveChange?.(!wasDismissed);
  }, [onActiveChange]);

  useEffect(() => {
    if (!hydrated || dismissed) return;

    if (reduceMotion) {
      setEntered(true);
      return;
    }

    let enterTimeout: number | undefined;
    let cancelled = false;

    const scheduleEnter = () => {
      enterTimeout = window.setTimeout(() => {
        if (!cancelled) setEntered(true);
      }, promoBanner.enterDelayMs);
    };

    if (document.readyState === "complete") {
      scheduleEnter();
    } else {
      window.addEventListener("load", scheduleEnter, { once: true });
    }

    return () => {
      cancelled = true;
      if (enterTimeout) window.clearTimeout(enterTimeout);
      window.removeEventListener("load", scheduleEnter);
    };
  }, [hydrated, dismissed, reduceMotion]);

  const isPromoInChrome =
    promoBanner.enabled && hydrated && !dismissed;

  useEffect(() => {
    onActiveChange?.(isPromoInChrome);
  }, [isPromoInChrome, onActiveChange]);

  useEffect(() => {
    if (!closing) return;

    const timeout = window.setTimeout(() => {
      setDismissed(true);
      setClosing(false);
      try {
        sessionStorage.setItem(promoBannerDismissKey(), "1");
      } catch {
        // ignore quota / private mode
      }
    }, reduceMotion ? 0 : PROMO_BANNER_EXIT_MS);

    return () => window.clearTimeout(timeout);
  }, [closing, reduceMotion]);

  const persistDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(promoBannerDismissKey(), "1");
    } catch {
      // ignore quota / private mode
    }
  };

  const handleDismiss = () => {
    if (reduceMotion) {
      persistDismiss();
      return;
    }
    setClosing(true);
  };

  if (!promoBanner.enabled || (hydrated && dismissed)) return null;

  return (
    <div
      className={cn(
        "promo-banner-shell",
        closing
          ? "promo-banner-shell-exit"
          : entered
            ? "promo-banner-shell-enter"
            : "promo-banner-shell-prep",
      )}
    >
      <div className="promo-banner-shell-inner">
        <div className="relative bg-[var(--brand-primary)] text-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-2 gap-y-1 px-10 py-2 text-center text-xs sm:gap-x-3 sm:px-12 sm:py-2.5 sm:text-sm">
            <span
              className={cn(
                "inline-flex rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide sm:text-xs",
                itemMotionClass(entered, closing, 1),
              )}
            >
              {promoBanner.badge}
            </span>
            <p
              className={cn(
                "min-w-0 leading-snug",
                itemMotionClass(entered, closing, 2),
              )}
            >
              <span className="font-medium">{promoBanner.headline}</span>
              <span className="hidden text-white/90 sm:inline">
                {" "}
                — {promoBanner.detail}
              </span>
            </p>
            <Link
              href={promoBanner.href}
              className={cn(
                "shrink-0 font-semibold underline decoration-white/50 underline-offset-2 transition-colors hover:text-white hover:decoration-white",
                itemMotionClass(entered, closing, 3),
              )}
            >
              {promoBanner.cta}
            </Link>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Cerrar promoción"
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white sm:right-3",
              itemMotionClass(entered, closing, 4),
            )}
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
