import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { isCatalogPathname } from "@/lib/storefront-paths";

export function pushCatalogRoute(
  router: AppRouterInstance,
  href: string,
  pathname: string,
) {
  const pathOnly = href.split("?")[0] ?? href;
  const targetIsCatalog = isCatalogPathname(pathOnly);
  const stayingOnCatalog = isCatalogPathname(pathname) && targetIsCatalog;

  if (stayingOnCatalog) {
    router.replace(href, { scroll: false });
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? "auto"
      : "smooth";
    window.scrollTo({ top: 0, behavior });
    return;
  }

  router.push(href);
}
