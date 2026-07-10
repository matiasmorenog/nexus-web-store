import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { PromoBannerContent } from "@/lib/home-content/types";
import { App2ButtonLink } from "@/themes/app2/components/app2-button";

type App2PromoBannerProps = {
  content: PromoBannerContent;
};

export function App2PromoBanner({ content }: App2PromoBannerProps) {
  return (
    <section id="ofertas" className="mx-auto max-w-7xl scroll-mt-28 px-4 pb-20 sm:px-6">
      <div className="relative overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] bg-gradient-to-br from-[color-mix(in_srgb,var(--brand-primary)_10%,transparent)] via-app2-card to-[color-mix(in_srgb,var(--brand-promo-accent)_10%,transparent)]">
        {content.backgroundImageUrl ? (
          <div className="absolute inset-0 opacity-10">
            <Image
              src={content.backgroundImageUrl}
              alt=""
              fill
              className="object-cover"
            />
          </div>
        ) : null}
        <div className="relative flex flex-col items-center justify-between gap-6 px-6 py-12 sm:flex-row sm:px-12 sm:py-16">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[var(--brand-primary)]">
              {content.eyebrow}
            </p>
            <h2 className="font-app2-display text-3xl font-bold text-[var(--brand-primary-light,#f0f0f5)] sm:text-5xl">
              {content.title}
              <br />
              <span className="text-[var(--brand-promo-accent)]">
                {content.titleHighlight}
              </span>
            </h2>
            {content.couponCode ? (
              <p className="mt-3 text-sm text-app2-muted">
                Usá el código{" "}
                <span className="rounded border border-[color-mix(in_srgb,var(--brand-primary)_30%,transparent)] bg-[color-mix(in_srgb,var(--brand-primary)_10%,transparent)] px-2 py-0.5 font-mono text-[var(--brand-primary)]">
                  {content.couponCode}
                </span>{" "}
                {content.couponHint ?? "al comprar"}
              </p>
            ) : null}
          </div>
          <App2ButtonLink
            href={content.cta.href}
            variant="promo"
            size="promo"
            className="shrink-0"
          >
            {content.cta.label} <ArrowRight className="h-4 w-4" />
          </App2ButtonLink>
        </div>
      </div>
    </section>
  );
}
