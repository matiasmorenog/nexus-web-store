"use client";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { readAdminLocaleFromDocument } from "@/lib/admin-locale";
import {
  resolveAdminModuleHeader,
  resolveAdminModuleTrailHeader,
} from "@/lib/admin-module-headers";

/** Module title in layout — outside that segment's loading.tsx. */
export function AdminModuleRouteHeader({
  modulePath,
}: {
  modulePath: string;
}) {
  const locale = readAdminLocaleFromDocument();
  const trail = resolveAdminModuleTrailHeader(modulePath, locale);
  if (trail) {
    return (
      <AdminPageHeader
        title={trail.parentTitle}
        titleCurrent={trail.title}
        description={trail.description}
      />
    );
  }

  const copy = resolveAdminModuleHeader(modulePath);
  if (!copy) return null;
  return (
    <AdminPageHeader title={copy.title} description={copy.description} />
  );
}
