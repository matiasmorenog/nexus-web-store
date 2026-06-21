"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type AdminContentScrollAreaProps = {
  children: React.ReactNode;
  className?: string;
};

function readRouteKey(pathname: string) {
  if (typeof window === "undefined") return pathname;
  return `${pathname}${window.location.search}`;
}

export function AdminContentScrollArea({
  children,
  className,
}: AdminContentScrollAreaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const scrollSnapshot = useRef<number | null>(null);
  const routeKey = useRef(readRouteKey(pathname));

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const onPointerDown = (event: PointerEvent) => {
      const anchor = (event.target as HTMLElement).closest("a[href]");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/admin")) return;

      try {
        const url = new URL(href, window.location.origin);
        if (url.pathname === pathname) {
          scrollSnapshot.current = container.scrollTop;
        }
      } catch {
        // ignore invalid href
      }
    };

    container.addEventListener("pointerdown", onPointerDown, true);
    return () => container.removeEventListener("pointerdown", onPointerDown, true);
  }, [pathname]);

  useLayoutEffect(() => {
    const container = ref.current;
    const nextRouteKey = readRouteKey(pathname);

    if (
      routeKey.current !== nextRouteKey &&
      scrollSnapshot.current !== null &&
      container
    ) {
      container.scrollTop = scrollSnapshot.current;
      scrollSnapshot.current = null;
    }

    routeKey.current = nextRouteKey;
  }, [pathname, children]);

  return (
    <div ref={ref} data-admin-scroll-area className={cn(className)}>
      {children}
    </div>
  );
}
