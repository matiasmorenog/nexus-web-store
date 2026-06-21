"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { pushAdminListRoute } from "@/lib/admin-navigation";

export function useAdminListNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  return useCallback(
    (href: string) => {
      pushAdminListRoute(router, href, pathname);
    },
    [pathname, router],
  );
}
