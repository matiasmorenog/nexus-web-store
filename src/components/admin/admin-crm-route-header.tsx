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

const CRM_PATH = "/admin/modulos/crm";

function parseCrmDetailEmail(pathname: string): string | null {
  if (!isCrmDetailPath(pathname)) return null;
  const rest = pathname.slice(`${CRM_PATH}/`.length);
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

/** CRM list/detail title in crm/layout — survives list↔detail loading. */
export function AdminCrmRouteHeader() {
  const pathname = usePathname();
  const copy = resolveAdminModuleHeader(CRM_PATH);
  if (!copy) return null;

  const detailEmail = parseCrmDetailEmail(pathname);
  if (detailEmail) {
    return (
      <Suspense
        fallback={
          <AdminPageHeader
            title={copy.title}
            titleHref={CRM_PATH}
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
