import { Suspense } from "react";
import { AdminCrmListClient } from "@/components/admin/admin-crm-list-client";
import { AdminSkeletonModuleCrmPage } from "@/components/admin/admin-skeleton";
import {
  adminCanManageModule,
  requireAdminModuleView,
} from "@/lib/admin-session";
import { requireModule } from "@/lib/modules";

export const dynamic = "force-dynamic";

export default async function AdminCrmPage() {
  const session = await requireAdminModuleView("crm");
  await requireModule("crm");
  const canManage = adminCanManageModule(session, "crm");

  return (
    <Suspense fallback={<AdminSkeletonModuleCrmPage />}>
      <AdminCrmListClient canManage={canManage} />
    </Suspense>
  );
}
