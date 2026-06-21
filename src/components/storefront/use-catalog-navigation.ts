"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { pushCatalogRoute } from "@/lib/catalog-navigation";

export function useCatalogNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  return useCallback(
    (href: string) => {
      pushCatalogRoute(router, href, pathname);
    },
    [pathname, router],
  );
}
