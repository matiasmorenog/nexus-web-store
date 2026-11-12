import { Check, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { AdminCard } from "@/components/admin/admin-card";
import { cn } from "@/lib/utils";
import {
  getModuleDefinition,
  getModuleMinPlan,
  isModuleId,
  listModulesInSidebarOrder,
  PLAN_CORE,
  PLAN_TIER_IDS,
  PLAN_TIERS,
  resolvePlanTier,
  type ModuleId,
  type PlanTierId,
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

function tierLabel(tierId: PlanTierId) {
  return PLAN_TIERS[tierId].name;
}

function planRequestMailto(tierId: PlanTierId) {
  const tier = PLAN_TIERS[tierId];
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    `Solicitar plan ${tier.name}`,
  )}&body=${encodeURIComponent(
    `Hola, quiero activar el plan ${tier.name} (${formatUsd(tier.monthlyPriceUsd)}/mes) en mi tienda.`,
  )}`;
}

export function AdminPlanOverview({
  enabledModuleIds,
  highlightedModuleId,
}: AdminPlanOverviewProps) {
  const enabled = new Set(enabledModuleIds);
  const currentTier = resolvePlanTier(enabledModuleIds);
  const modules = listModulesInSidebarOrder();

  return (
    <div className="space-y-8">
      <div className="grid items-stretch gap-4 lg:grid-cols-3">
        {PLAN_TIER_IDS.map((tierId) => {
          const tier = PLAN_TIERS[tierId];
          const isCurrent = currentTier.id === tierId;
          const isFeatured = Boolean(tier.featured);
          const tierModules = modules.filter((module) =>
            tier.moduleIds.includes(module.id),
          );

          return (
            <div
              key={tier.id}
              className={cn(
                "relative flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm",
                isFeatured
                  ? "border-[var(--brand-primary)]/40 shadow-[0_12px_40px_-20px_color-mix(in_srgb,var(--brand-primary)_55%,transparent)] lg:-mt-1 lg:mb-[-0.25rem]"
                  : "border-neutral-200",
                isCurrent &&
                  !isFeatured &&
                  "ring-2 ring-[var(--brand-primary)] ring-offset-2",
                isCurrent &&
                  isFeatured &&
                  "ring-2 ring-[var(--brand-primary)] ring-offset-2",
              )}
            >
              {isFeatured ? (
                <div className="bg-[var(--brand-primary)] px-4 py-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-white">
                  Más popular
                </div>
              ) : (
                <div className="h-[1.625rem]" aria-hidden />
              )}

              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold tracking-tight text-neutral-900">
                      {tier.name}
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500">{tier.target}</p>
                  </div>
                  {isCurrent ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      <Check className="h-3.5 w-3.5" />
                      Actual
                    </span>
                  ) : null}
                </div>

                <p className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tabular-nums tracking-tight text-neutral-900">
                    {formatUsd(tier.monthlyPriceUsd)}
                  </span>
                  <span className="text-sm font-medium text-neutral-500">
                    /mes
                  </span>
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Anual {formatUsd(tier.annualMonthlyUsd)}/mes (−20%)
                </p>
                <p className="mt-3 text-sm text-neutral-600">{tier.description}</p>

                <ul className="mt-5 space-y-2 border-t border-neutral-100 pt-4">
                  {tier.perks.map((perk) => (
                    <li
                      key={perk}
                      className="flex items-start gap-2 text-sm font-medium text-neutral-800"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-primary)]" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                  Módulos incluidos
                </p>
                <ul className="mt-2 space-y-1.5">
                  {tierModules.map((module) => (
                    <li
                      key={module.id}
                      className="flex items-start gap-2 text-sm text-neutral-600"
                    >
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      <span>{module.name}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-6">
                  {isCurrent ? (
                    <span className="flex h-10 w-full items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-sm font-medium text-emerald-800">
                      Plan activo
                    </span>
                  ) : (
                    <a
                      href={planRequestMailto(tierId)}
                      className={cn(
                        "flex h-10 w-full items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition-colors",
                        isFeatured
                          ? "bg-[var(--brand-primary)] text-white hover:opacity-90"
                          : "border border-neutral-200 bg-white text-neutral-800 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]",
                      )}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Solicitar {tier.name}
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AdminCard
        title="Núcleo (todos los planes)"
        description="Operación diaria incluida en Start, Grow y Pro. Sin comisión sobre ventas."
      >
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {PLAN_CORE.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2 text-sm text-neutral-700"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-neutral-500">
          Plan inferido en esta tienda:{" "}
          <span className="font-medium text-neutral-800">{currentTier.name}</span>{" "}
          ({formatUsd(currentTier.monthlyPriceUsd)}/mes) según módulos activos.
        </p>
      </AdminCard>

      {highlightedModuleId && !enabled.has(highlightedModuleId) ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">
            Necesitás el plan{" "}
            <span className="text-amber-950">
              {tierLabel(getModuleMinPlan(highlightedModuleId))}
            </span>{" "}
            (módulo{" "}
            <span className="text-amber-950">
              {getModuleDefinition(highlightedModuleId).name}
            </span>
            ) para acceder a esa sección.
          </p>
        </div>
      ) : null}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Módulos por plan
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => {
            const isActive = enabled.has(module.id);
            const isHighlighted = highlightedModuleId === module.id;
            const minPlan = getModuleMinPlan(module.id);

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
                        {tierLabel(minPlan)}+
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-3">
                    <p className="text-sm font-medium text-neutral-700">
                      Desde{" "}
                      <span className="font-bold text-neutral-900">
                        {tierLabel(minPlan)}
                      </span>
                      <span className="font-normal text-neutral-500">
                        {" "}
                        ({formatUsd(PLAN_TIERS[minPlan].monthlyPriceUsd)}/mes)
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
                        href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Plan ${tierLabel(minPlan)}: ${module.name}`)}`}
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

      <AdminCard
        title="¿Cómo cambiar de plan?"
        description="Hoy la activación es manual. En Fase C (NEX-10) billing cobra el tier automáticamente."
      >
        <ol className="list-decimal space-y-2 pl-5 text-sm text-neutral-600">
          <li>Elegí Start, Grow o Pro según lo que necesitás.</li>
          <li>Pedí el cambio por email (botón Solicitar en el plan o módulo).</li>
          <li>Activamos los módulos del tier en tu tienda.</li>
        </ol>
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
