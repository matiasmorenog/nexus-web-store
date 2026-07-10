"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { app2ButtonClassName, App2ButtonLink } from "@/themes/app2/components/app2-button";
import { App2ProductCard, type App2ProductCardData } from "@/themes/app2/components/home/app2-product-card";
import { App2SectionHeading } from "@/themes/app2/components/home/app2-section-heading";

const FILTER_TABS = ["Todos", "Destacados", "Nuevos", "Ofertas"] as const;
type FilterTab = (typeof FILTER_TABS)[number];

type App2ProductsSectionProps = {
  products: App2ProductCardData[];
  title?: string;
};

export function App2ProductsSection({
  products,
  title = "PRODUCTOS DESTACADOS",
}: App2ProductsSectionProps) {
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
    <section id="productos-app2" className="mx-auto max-w-7xl scroll-mt-28 px-4 pb-20 sm:px-6">
      <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <App2SectionHeading eyebrow="Selección" title={title} />
        <div className="flex gap-1 rounded-lg border border-app2 bg-[color-mix(in_srgb,var(--brand-primary-dark)_40%,transparent)] p-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={app2ButtonClassName({
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
            <App2ProductCard key={product.id} {...product} />
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-sm text-app2-muted">
          No hay productos en esta categoría por ahora.
        </p>
      )}

      <div className="mt-10 flex justify-center">
        <App2ButtonLink href="/productos" variant="ghost" size="lg" className="px-8">
          Ver todos los productos <ArrowRight className="h-3.5 w-3.5" />
        </App2ButtonLink>
      </div>
    </section>
  );
}
