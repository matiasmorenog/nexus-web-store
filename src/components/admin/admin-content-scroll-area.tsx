"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type AdminContentScrollAreaProps = {
  children: React.ReactNode;
  className?: string;
};

export function AdminContentScrollArea({
  children,
  className,
}: AdminContentScrollAreaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const scrollSnapshot = useRef<number | null>(null);
  const routeKey = useRef(`${pathname}?${query}`);

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
    const nextRouteKey = `${pathname}?${query}`;

    if (
      routeKey.current !== nextRouteKey &&
      scrollSnapshot.current !== null &&
      container
    ) {
      container.scrollTop = scrollSnapshot.current;
      scrollSnapshot.current = null;
    }

    routeKey.current = nextRouteKey;
  }, [pathname, query]);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
