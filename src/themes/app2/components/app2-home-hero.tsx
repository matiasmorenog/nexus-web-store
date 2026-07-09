import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { HeroStaticContent } from "@/lib/home-content/types";
import { App2BrandWordmark } from "@/themes/app2/components/home/app2-brand-wordmark";
import { App2HeroNatureDecor } from "@/themes/app2/components/app2-nature-decor";
import { App2ButtonLink } from "@/themes/app2/components/app2-button";

type App2HomeHeroProps = {
  storeDisplayName: string;
  content: HeroStaticContent;
};

export function App2HomeHero({ storeDisplayName, content }: App2HomeHeroProps) {
  return (
    <section className="relative flex min-h-[min(88vh,40rem)] items-center overflow-hidden bg-[var(--jungle-night-sky)]">
      <div className="absolute inset-0">
        <Image
          src={content.backgroundImageUrl}
          alt=""
          fill
          priority
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--app2-hero-overlay)] via-[color-mix(in_srgb,var(--app2-hero-overlay)_85%,transparent)] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--app2-hero-overlay)] via-transparent to-transparent" />
      </div>

      <div
        className="pointer-events-none absolute top-1/3 right-1/4 h-96 w-96 rounded-full opacity-10 blur-3xl"
        style={{ background: "var(--brand-primary)" }}
        aria-hidden
      />

      <App2HeroNatureDecor />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--brand-primary)_30%,transparent)] bg-[color-mix(in_srgb,var(--brand-primary)_10%,transparent)] px-3 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--brand-primary)]" />
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--brand-primary)]">
              {content.eyebrow}
            </span>
          </div>

          <div className="mb-3">
            <App2BrandWordmark storeName={storeDisplayName} size="sm" />
          </div>

          <h1 className="font-app2-display text-5xl font-bold leading-none tracking-tight text-[var(--brand-primary-light,#f0f0f5)] sm:text-7xl">
            {content.titleLine1}
            <br />
            <span
              className={
                content.titleLine2Highlight
                  ? "text-[var(--brand-primary)] text-glow-primary"
                  : undefined
              }
            >
              {content.titleLine2}
            </span>
            <br />
            {content.titleLine3}
          </h1>

          <p className="mt-6 max-w-lg text-base font-light leading-relaxed text-app2-muted sm:text-lg">
            {content.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <App2ButtonLink
              href={content.primaryCta.href}
              variant="primary"
              size="lg"
            >
              {content.primaryCta.label}
              <ArrowRight className="h-4 w-4" />
            </App2ButtonLink>
            <App2ButtonLink
              href={content.secondaryCta.href}
              variant="secondary"
              size="lg"
            >
              {content.secondaryCta.label}
            </App2ButtonLink>
          </div>

          {content.stats.length > 0 ? (
            <div className="mt-12 flex flex-wrap gap-8">
              {content.stats.map((stat) => (
                <div key={`${stat.label}-${stat.value}`}>
                  <div className="font-app2-display text-2xl font-bold text-[var(--brand-primary)]">
                    {stat.value}
                  </div>
                  <div className="mt-0.5 text-xs text-app2-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
