"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { vapeButtonClassName, VapeButtonLink } from "@/components/storefront/vape/vape-button";
import { VapeProductCard, type VapeProductCardData } from "@/components/storefront/home/vape/vape-product-card";
import { VapeSectionHeading } from "@/components/storefront/home/vape/vape-section-heading";

const FILTER_TABS = ["Todos", "Destacados", "Nuevos", "Ofertas"] as const;
type FilterTab = (typeof FILTER_TABS)[number];

type VapeProductsSectionProps = {
  products: VapeProductCardData[];
  title?: string;
};

export function VapeProductsSection({
  products,
  title = "PRODUCTOS DESTACADOS",
}: VapeProductsSectionProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("Todos");

  const filtered = useMemo(() => {
    switch (activeTab) {
      case "Destacados":
        return products.filter((p) => p.featured);
      case "Ofertas":
        return products.filter((p) => p.promo2x1);
      case "Nuevos":
        return products.slice(0, 8);
      default:
        return products;
    }
  }, [activeTab, products]);

  return (
    <section id="productos-vape" className="mx-auto max-w-7xl scroll-mt-28 px-4 pb-20 sm:px-6">
      <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <VapeSectionHeading eyebrow="Selección" title={title} />
        <div className="flex gap-1 rounded-lg border border-vape bg-[color-mix(in_srgb,var(--brand-primary-dark)_40%,transparent)] p-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={vapeButtonClassName({
                variant: activeTab === tab ? "tab-active" : "tab",
                size: "sm",
              })}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {filtered.map((product) => (
            <VapeProductCard key={product.id} {...product} />
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-sm text-vape-muted">
          No hay productos en esta categoría por ahora.
        </p>
      )}

      <div className="mt-10 flex justify-center">
        <VapeButtonLink href="/productos" variant="ghost" size="lg" className="px-8">
          Ver todos los productos <ArrowRight className="h-3.5 w-3.5" />
        </VapeButtonLink>
      </div>
    </section>
  );
}
