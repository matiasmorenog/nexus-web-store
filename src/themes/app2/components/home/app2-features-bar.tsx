import { Shield, Truck, Zap } from "lucide-react";
import type { FeaturesBarContent } from "@/lib/home-content/types";

const ICONS = [Truck, Shield, Zap] as const;

type App2FeaturesBarProps = {
  content: FeaturesBarContent;
};

export function App2FeaturesBar({ content }: App2FeaturesBarProps) {
  return (
    <section className="border-y border-app2 bg-[color-mix(in_srgb,var(--brand-primary-dark)_35%,transparent)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-[color-mix(in_srgb,var(--brand-primary)_12%,transparent)]">
          {content.items.map((feature, index) => {
            const Icon = ICONS[index % ICONS.length];
            return (
              <div
                key={`${feature.title}-${index}`}
                className="flex items-center gap-3 sm:px-8 first:sm:pl-0 last:sm:pr-0"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--brand-primary)_10%,transparent)]">
                  <Icon className="h-[18px] w-[18px] text-[var(--brand-primary)]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[var(--brand-primary-light,#f0f0f5)]">
                    {feature.title}
                  </div>
                  <div className="text-xs text-app2-muted">{feature.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
