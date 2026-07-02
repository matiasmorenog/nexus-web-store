import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { VapeBrandWordmark } from "@/components/storefront/home/vape/vape-brand-wordmark";
import { VapeHeroNatureDecor } from "@/components/storefront/home/vape-nature-decor";
import { VapeButtonLink } from "@/components/storefront/vape/vape-button";
import { VAPE_HERO_STATS } from "@/lib/store-verticals/vape/home-content";

type VapeHomeHeroProps = {
  storeDisplayName: string;
};

export function VapeHomeHero({ storeDisplayName }: VapeHomeHeroProps) {
  return (
    <section className="relative flex min-h-[min(88vh,40rem)] items-center overflow-hidden bg-[var(--jungle-night-sky)]">
      <div className="absolute inset-0">
        <Image
          src="https://source.unsplash.com/1600x900/?vape,neon,smoke"
          alt=""
          fill
          priority
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--vape-hero-overlay)] via-[color-mix(in_srgb,var(--vape-hero-overlay)_85%,transparent)] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--vape-hero-overlay)] via-transparent to-transparent" />
      </div>

      <div
        className="pointer-events-none absolute top-1/3 right-1/4 h-96 w-96 rounded-full opacity-10 blur-3xl"
        style={{ background: "var(--brand-primary)" }}
        aria-hidden
      />

      <VapeHeroNatureDecor />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--brand-primary)_30%,transparent)] bg-[color-mix(in_srgb,var(--brand-primary)_10%,transparent)] px-3 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--brand-primary)]" />
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--brand-primary)]">
              Nuevas llegadas 2025
            </span>
          </div>

          <div className="mb-3">
            <VapeBrandWordmark storeName={storeDisplayName} size="sm" />
          </div>

          <h1 className="font-vape-display text-5xl font-bold leading-none tracking-tight text-[var(--brand-primary-light,#f0f0f5)] sm:text-7xl">
            ELEVA TU
            <br />
            <span className="text-[var(--brand-primary)] text-glow-primary">EXPERIENCIA</span>
            <br />
            VAPE
          </h1>

          <p className="mt-6 max-w-lg text-base font-light leading-relaxed text-vape-muted sm:text-lg">
            Los mejores dispositivos, e-líquidos y accesorios. Envío gratis en pedidos
            mayores a $50. Calidad certificada, sabores únicos.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <VapeButtonLink href="/productos" variant="primary" size="lg">
              Comprar ahora
              <ArrowRight className="h-4 w-4" />
            </VapeButtonLink>
            <VapeButtonLink href="/productos" variant="secondary" size="lg">
              Ver catálogo
            </VapeButtonLink>
          </div>

          <div className="mt-12 flex gap-8">
            {VAPE_HERO_STATS.map((stat) => (
              <div key={stat.label}>
                <div className="font-vape-display text-2xl font-bold text-[var(--brand-primary)]">
                  {stat.value}
                </div>
                <div className="mt-0.5 text-xs text-vape-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
