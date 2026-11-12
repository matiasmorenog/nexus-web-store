"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  isCrmDetailPath,
  resolveAdminModuleHeader,
} from "@/lib/admin-module-headers";
import {
  normalizeCustomerEmail,
  resolveCrmListReturnHref,
} from "@/lib/crm/format";

function parseCrmDetailEmail(pathname: string): string | null {
  if (!isCrmDetailPath(pathname)) return null;
  const rest = pathname.slice("/admin/modulos/crm/".length);
  try {
    return normalizeCustomerEmail(decodeURIComponent(rest));
  } catch {
    return null;
  }
}

function AdminModulosHeaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const copy = resolveAdminModuleHeader(pathname);

  if (!copy) return null;

  const detailEmail = parseCrmDetailEmail(pathname);
  if (detailEmail) {
    const listHref = resolveCrmListReturnHref(searchParams.get("from"));
    const nameParam = searchParams.get("name")?.trim();
    return (
      <AdminPageHeader
        title={copy.title}
        titleHref={listHref}
        titleCurrent={nameParam || detailEmail}
        description={detailEmail}
        className="mb-0"
      />
    );
  }

  return (
    <AdminPageHeader
      title={copy.title}
      description={copy.description}
      className="mb-0"
    />
  );
}

function AdminModulosHeaderFallback() {
  // Avoid blank flash while useSearchParams resolves; title fills in immediately after.
  return <div className="h-[4.5rem]" aria-hidden />;
}

/** Persistent module title — outside loading.tsx so it does not skeleton. */
export function AdminModulosHeader() {
  return (
    <Suspense fallback={<AdminModulosHeaderFallback />}>
      <AdminModulosHeaderInner />
    </Suspense>
  );
}
