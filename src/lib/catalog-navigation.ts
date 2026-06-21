import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function pushCatalogRoute(
  router: AppRouterInstance,
  href: string,
  pathname: string,
) {
  const targetIsCatalog = href === "/productos" || href.startsWith("/productos?");
  const stayingOnCatalog = pathname === "/productos" && targetIsCatalog;

  if (stayingOnCatalog) {
    router.push(href, { scroll: false });
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? "auto"
      : "smooth";
    window.scrollTo({ top: 0, behavior });
    return;
  }

  router.push(href);
}
