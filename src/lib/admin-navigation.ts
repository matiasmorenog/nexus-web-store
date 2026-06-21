import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const ADMIN_SCROLL_AREA_SELECTOR = "[data-admin-scroll-area]";

export function scrollAdminContentToTop(behavior: ScrollBehavior = "smooth") {
  const container = document.querySelector(
    ADMIN_SCROLL_AREA_SELECTOR,
  ) as HTMLElement | null;

  container?.scrollTo({ top: 0, behavior });
}

function adminListBase(path: string) {
  if (path.startsWith("/admin/productos")) return "/admin/productos";
  if (path.startsWith("/admin/pedidos")) return "/admin/pedidos";
  return null;
}

export function pushAdminListRoute(
  router: AppRouterInstance,
  href: string,
  pathname: string,
) {
  const stayingOnList =
    adminListBase(pathname) !== null &&
    adminListBase(pathname) === adminListBase(href);

  if (stayingOnList) {
    router.push(href, { scroll: false });
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? "auto"
      : "smooth";
    scrollAdminContentToTop(behavior);
    return;
  }

  router.push(href);
}
