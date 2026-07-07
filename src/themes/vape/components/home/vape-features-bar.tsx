import { Shield, Truck, Zap } from "lucide-react";
import { VAPE_HOME_FEATURES } from "@/lib/store-verticals/vape/home-content";

const ICONS = [Truck, Shield, Zap] as const;

export function VapeFeaturesBar() {
  return (
    <section className="border-y border-vape bg-[color-mix(in_srgb,var(--brand-primary-dark)_35%,transparent)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-[color-mix(in_srgb,var(--brand-primary)_12%,transparent)]">
          {VAPE_HOME_FEATURES.map((feature, index) => {
            const Icon = ICONS[index];
            return (
              <div
                key={feature.title}
                className="flex items-center gap-3 sm:px-8 first:sm:pl-0 last:sm:pr-0"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--brand-primary)_10%,transparent)]">
                  <Icon className="h-[18px] w-[18px] text-[var(--brand-primary)]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[var(--brand-primary-light,#f0f0f5)]">
                    {feature.title}
                  </div>
                  <div className="text-xs text-vape-muted">{feature.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
