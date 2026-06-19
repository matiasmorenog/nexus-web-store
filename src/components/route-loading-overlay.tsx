"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useRouteLoading } from "@/lib/route-loading-context";
import { cn } from "@/lib/utils";

const SHOW_DELAY_MS = 120;

function isSameRoute(
  pathname: string,
  search: string,
  target: URL,
): boolean {
  const current = pathname + (search ? `?${search}` : "");
  const next = target.pathname + target.search;
  return current === next;
}

function shouldStartNavigation(
  event: MouseEvent,
  anchor: HTMLAnchorElement,
  pathname: string,
  search: string,
): boolean {
  if (event.defaultPrevented) return false;
  if (event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (anchor.target === "_blank") return false;
  if (anchor.hasAttribute("download")) return false;

  const href = anchor.getAttribute("href");
  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return false;
  }

  let url: URL;
  try {
    url = new URL(anchor.href, window.location.href);
  } catch {
    return false;
  }

  if (url.origin !== window.location.origin) return false;
  if (isSameRoute(pathname, search, url)) return false;

  return true;
}

export function RouteLoadingOverlay() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const { overlayVisible, startLoading, finishLoading } = useRouteLoading();
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearShowTimer = () => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
  };

  const scheduleShow = () => {
    clearShowTimer();
    showTimerRef.current = setTimeout(() => startLoading(), SHOW_DELAY_MS);
  };

  useEffect(() => {
    clearShowTimer();
    finishLoading();
  }, [pathname, search, finishLoading]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest("a");
      if (!anchor) return;
      if (!shouldStartNavigation(event, anchor, pathname, search)) return;
      scheduleShow();
    };

    const onPopState = () => scheduleShow();

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
      clearShowTimer();
    };
  }, [pathname, search]);

  if (!overlayVisible) return null;

  return (
    <>
      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 bottom-0 z-[200]",
          "bg-white/25 backdrop-blur-[3px]",
          "route-loading-enter",
        )}
        style={{ top: "var(--storefront-banner-height, 0px)" }}
        aria-hidden
      />
      <p className="sr-only" role="status" aria-live="polite">
        Cargando página…
      </p>
    </>
  );
}
