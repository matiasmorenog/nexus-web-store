import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { VapeButtonLink } from "@/components/storefront/vape/vape-button";
import { VAPE_PROMO } from "@/lib/store-verticals/vape/home-content";

export function VapePromoBanner() {
  return (
    <section id="ofertas" className="mx-auto max-w-7xl scroll-mt-28 px-4 pb-20 sm:px-6">
      <div className="relative overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] bg-gradient-to-br from-[color-mix(in_srgb,var(--brand-primary)_10%,transparent)] via-vape-card to-[color-mix(in_srgb,var(--brand-promo-accent)_10%,transparent)]">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="https://source.unsplash.com/1400x400/?vape,device,dark"
            alt=""
            fill
            className="object-cover"
          />
        </div>
        <div className="relative flex flex-col items-center justify-between gap-6 px-6 py-12 sm:flex-row sm:px-12 sm:py-16">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[var(--brand-primary)]">
              Oferta limitada
            </p>
            <h2 className="font-vape-display text-3xl font-bold text-[var(--brand-primary-light,#f0f0f5)] sm:text-5xl">
              {VAPE_PROMO.title}
              <br />
              <span className="text-[var(--brand-promo-accent)]">{VAPE_PROMO.highlight}</span>
            </h2>
            <p className="mt-3 text-sm text-vape-muted">
              Usá el código{" "}
              <span className="rounded border border-[color-mix(in_srgb,var(--brand-primary)_30%,transparent)] bg-[color-mix(in_srgb,var(--brand-primary)_10%,transparent)] px-2 py-0.5 font-mono text-[var(--brand-primary)]">
                {VAPE_PROMO.code}
              </span>{" "}
              al comprar
            </p>
          </div>
          <VapeButtonLink href="#productos-vape" variant="promo" size="promo" className="shrink-0">
            Canjear oferta <ArrowRight className="h-4 w-4" />
          </VapeButtonLink>
        </div>
      </div>
    </section>
  );
}
