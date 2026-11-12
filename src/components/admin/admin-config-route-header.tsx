"use client";

import { usePathname } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { readAdminLocaleFromDocument } from "@/lib/admin-locale";
import { resolveAdminConfigTrailHeader } from "@/lib/admin-module-headers";

/**
 * Configuración › page title — lives in layout so loading.tsx does not skeleton it.
 */
export function AdminConfigRouteHeader() {
  const pathname = usePathname();
  const locale = readAdminLocaleFromDocument();
  const copy = resolveAdminConfigTrailHeader(pathname, locale);
  if (!copy) return null;

  return (
    <AdminPageHeader
      title={copy.parentTitle}
      titleCurrent={copy.title}
      description={copy.description}
    />
  );
}
