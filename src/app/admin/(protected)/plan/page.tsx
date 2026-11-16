import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminPlanOverview } from "@/components/admin/admin-plan-overview";
import { requireAdminPermission } from "@/lib/admin-session";
import { parseHighlightedModule, storeHidesPlanCatalog } from "@/lib/modules";
import { getEnabledModuleIds } from "@/lib/modules/access-server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type AdminPlanPageProps = {
  searchParams: Promise<{ module?: string }>;
};

export default async function AdminPlanPage({ searchParams }: AdminPlanPageProps) {
  if (storeHidesPlanCatalog()) {
    redirect("/admin");
  }
  await requireAdminPermission("plan:view");
  const enabledModuleIds = await getEnabledModuleIds();
  const { module: moduleParam } = await searchParams;
  const highlightedModuleId = parseHighlightedModule(moduleParam);

  return (
    <AdminDashboardReveal index={0}>
      <AdminPlanOverview
        enabledModuleIds={enabledModuleIds}
        highlightedModuleId={highlightedModuleId}
      />
    </AdminDashboardReveal>
  );
}
