import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminPlanOverview,
  parseHighlightedModule,
} from "@/components/admin/admin-plan-overview";
import { requireAdminPermission } from "@/lib/admin-session";
import { getEnabledModuleIds } from "@/lib/modules";

export const dynamic = "force-dynamic";

type AdminPlanPageProps = {
  searchParams: Promise<{ module?: string }>;
};

export default async function AdminPlanPage({ searchParams }: AdminPlanPageProps) {
  await requireAdminPermission("plan:view");
  const enabledModuleIds = await getEnabledModuleIds();
  const { module: moduleParam } = await searchParams;
  const highlightedModuleId = parseHighlightedModule(moduleParam);

  return (
    <div>
      <AdminDashboardReveal index={0}>
        <AdminPageHeader
          title="Plan y módulos"
          description="Plan base y módulos Plus disponibles para tu tienda."
        />
      </AdminDashboardReveal>
      <AdminDashboardReveal index={1}>
        <AdminPlanOverview
          enabledModuleIds={enabledModuleIds}
          highlightedModuleId={highlightedModuleId}
        />
      </AdminDashboardReveal>
    </div>
  );
}
