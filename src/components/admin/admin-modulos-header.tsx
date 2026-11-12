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

function CrmDetailTrail({
  title,
  detailEmail,
}: {
  title: string;
  detailEmail: string;
}) {
  const searchParams = useSearchParams();
  const listHref = resolveCrmListReturnHref(searchParams.get("from"));
  const nameParam = searchParams.get("name")?.trim();

  return (
    <AdminPageHeader
      title={title}
      titleHref={listHref}
      titleCurrent={nameParam || detailEmail}
      description={detailEmail}
    />
  );
}

/** Persistent module title — outside loading.tsx so it does not skeleton. */
export function AdminModulosHeader() {
  const pathname = usePathname();
  const copy = resolveAdminModuleHeader(pathname);
  if (!copy) return null;

  const detailEmail = parseCrmDetailEmail(pathname);
  if (detailEmail) {
    return (
      <Suspense
        fallback={
          <AdminPageHeader
            title={copy.title}
            titleHref="/admin/modulos/crm"
            titleCurrent={detailEmail}
            description={detailEmail}
          />
        }
      >
        <CrmDetailTrail title={copy.title} detailEmail={detailEmail} />
      </Suspense>
    );
  }

  return (
    <AdminPageHeader title={copy.title} description={copy.description} />
  );
}
