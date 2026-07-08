import { Construction } from "lucide-react";
import Link from "next/link";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getModuleDefinition, type ModuleId } from "@/lib/modules";
import { ADMIN_PLAN_PATH } from "@/lib/modules/access";

type AdminModulePlaceholderProps = {
  moduleId: ModuleId;
};

export function AdminModulePlaceholder({ moduleId }: AdminModulePlaceholderProps) {
  const moduleDef = getModuleDefinition(moduleId);
  const plannedRoutes = moduleDef.adminRoutes.join(", ");

  return (
    <div>
      <AdminDashboardReveal index={0}>
        <AdminPageHeader
          title={moduleDef.name}
          description={moduleDef.description}
        />
      </AdminDashboardReveal>

      <AdminDashboardReveal index={1}>
        <AdminCard>
          <div className="flex flex-col items-center px-4 py-10 text-center sm:px-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
              <Construction className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-neutral-900">
              Módulo en desarrollo
            </h2>
            <p className="mt-2 max-w-md text-sm text-neutral-500">
              Este módulo está activo en tu plan. La interfaz completa se
              implementará en las próximas entregas de Fase B.
            </p>
            {plannedRoutes ? (
              <p className="mt-4 text-xs text-neutral-400">
                Rutas previstas: {plannedRoutes}
              </p>
            ) : null}
            <Link
              href={ADMIN_PLAN_PATH}
              className="mt-6 text-sm font-medium text-[var(--brand-primary)] hover:underline"
            >
              Volver a Plan y módulos
            </Link>
          </div>
        </AdminCard>
      </AdminDashboardReveal>
    </div>
  );
}
