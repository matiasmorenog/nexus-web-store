import { Check, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { AdminCard } from "@/components/admin/admin-card";
import { cn } from "@/lib/utils";
import {
  BASE_PLAN,
  estimateMonthlyTotal,
  getModuleDefinition,
  isModuleId,
  listModulesByCategory,
  type ModuleId,
} from "@/lib/modules";
import { moduleAdminPath } from "@/lib/modules/access";

const SUPPORT_EMAIL = "hola@nexus.dev";

type AdminPlanOverviewProps = {
  enabledModuleIds: ModuleId[];
  highlightedModuleId?: ModuleId;
};

function formatUsd(amount: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function AdminPlanOverview({
  enabledModuleIds,
  highlightedModuleId,
}: AdminPlanOverviewProps) {
  const enabled = new Set(enabledModuleIds);
  const monthlyTotal = estimateMonthlyTotal(enabledModuleIds);
  const groups = listModulesByCategory();

  return (
    <div className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminCard
          title="Plan Base"
          description="Incluido en todos los contratos. Operación diaria de la tienda."
        >
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-3xl font-bold text-neutral-900">
              {formatUsd(BASE_PLAN.monthlyPriceUsd)}
              <span className="text-base font-normal text-neutral-500">/mes</span>
            </p>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              <Check className="h-3.5 w-3.5" />
              Activo
            </span>
          </div>
          <p className="mt-3 text-sm text-neutral-600">{BASE_PLAN.description}</p>
        </AdminCard>

        <AdminCard
          title="Tu plan actual"
          description="Base + módulos Plus activos en esta tienda."
        >
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-3xl font-bold text-neutral-900">
              {formatUsd(monthlyTotal)}
              <span className="text-base font-normal text-neutral-500">/mes</span>
            </p>
            <span className="text-sm text-neutral-500">
              {enabledModuleIds.length === 0
                ? "Sin módulos Plus"
                : `${enabledModuleIds.length} módulo${enabledModuleIds.length === 1 ? "" : "s"} Plus`}
            </span>
          </div>
          {enabledModuleIds.length > 0 ? (
            <ul className="mt-4 space-y-1.5 text-sm text-neutral-600">
              {enabledModuleIds.map((id) => (
                <li key={id} className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                  {getModuleDefinition(id).name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-neutral-500">
              Activá módulos Plus para ampliar el backoffice y el storefront.
            </p>
          )}
        </AdminCard>
      </div>

      {highlightedModuleId && !enabled.has(highlightedModuleId) ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">
            Necesitás el módulo{" "}
            <span className="text-amber-950">
              {getModuleDefinition(highlightedModuleId).name}
            </span>{" "}
            para acceder a esa sección.
          </p>
        </div>
      ) : null}

      {groups.map(({ category, label, modules }) => (
        <section key={category}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            {label}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {modules.map((module) => {
              const isActive = enabled.has(module.id);
              const isHighlighted = highlightedModuleId === module.id;

              return (
                <AdminCard
                  key={module.id}
                  className={cn(
                    isHighlighted && !isActive && "ring-2 ring-amber-300",
                  )}
                  padding={false}
                >
                  <div className="flex h-full flex-col p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-neutral-900">
                          {module.name}
                        </h3>
                        <p className="mt-1 text-sm text-neutral-500">
                          {module.description}
                        </p>
                      </div>
                      {isActive ? (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                          <Check className="h-3 w-3" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
                          <Lock className="h-3 w-3" />
                          Plus
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-end justify-between gap-3">
                      <p className="text-lg font-bold text-neutral-900">
                        +{formatUsd(module.monthlyPriceUsd)}
                        <span className="text-sm font-normal text-neutral-500">
                          /mes
                        </span>
                      </p>

                      {isActive ? (
                        <Link
                          href={moduleAdminPath(module.id)}
                          className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
                        >
                          Abrir
                        </Link>
                      ) : (
                        <a
                          href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Activar módulo: ${module.name}`)}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Solicitar
                        </a>
                      )}
                    </div>
                  </div>
                </AdminCard>
              );
            })}
          </div>
        </section>
      ))}

      <AdminCard
        title="¿Cómo activar un módulo?"
        description="Hoy la activación es manual. En Fase C se integrará billing automático."
      >
        <ol className="list-decimal space-y-2 pl-5 text-sm text-neutral-600">
          <li>Elegí el módulo y hacé clic en &quot;Solicitar&quot;.</li>
          <li>Te contactamos para confirmar el add-on y el nuevo total mensual.</li>
          <li>Activamos el módulo en tu tienda (env o panel interno).</li>
        </ol>
        <p className="mt-4 text-sm text-neutral-500">
          En desarrollo local podés restringir módulos con{" "}
          <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs">
            ENABLED_MODULES=none
          </code>{" "}
          o un subconjunto en tu{" "}
          <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs">.env</code>.
          Por defecto todos están activos en demo.
        </p>
      </AdminCard>
    </div>
  );
}

export function parseHighlightedModule(
  value: string | undefined,
): ModuleId | undefined {
  if (!value || !isModuleId(value)) return undefined;
  return value;
}
