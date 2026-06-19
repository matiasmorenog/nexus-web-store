"use client";

import { useCallback, useEffect, useState } from "react";
import { ProductEditForm } from "@/components/admin/product-edit-form";
import {
  ProductColorsCard,
  VariantManager,
  type VariantRow,
} from "@/components/admin/variant-manager";

export type ProductEditSection = "product" | "colors" | "variants";

type ProductEditSectionsProps = {
  product: {
    id: string;
    name: string;
    description: string;
    category: string;
    audience: string;
    featured: boolean;
    promo2x1: boolean;
  };
};

export function ProductEditSections({ product }: ProductEditSectionsProps) {
  const [activeSection, setActiveSection] =
    useState<ProductEditSection | null>("product");
  const [colorBusy, setColorBusy] = useState(false);
  const [variantBusy, setVariantBusy] = useState(false);
  const sectionBusy = colorBusy || variantBusy;
  const [blockedHint, setBlockedHint] = useState(0);
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [variantsFetched, setVariantsFetched] = useState(false);
  const [variantsError, setVariantsError] = useState<string | null>(null);

  const loadVariants = useCallback(
    async (force = false) => {
      if (!force && (variantsFetched || variantsLoading)) return;

      setVariantsLoading(true);
      setVariantsError(null);

      try {
        const res = await fetch(`/api/admin/products/${product.id}/variants`);
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(data?.error ?? "No se pudieron cargar las variantes");
        }

        const data = (await res.json()) as { variants: VariantRow[] };
        setVariants(data.variants);
        setVariantsFetched(true);
      } catch (err) {
        setVariantsError(
          err instanceof Error ? err.message : "Error al cargar variantes",
        );
      } finally {
        setVariantsLoading(false);
      }
    },
    [product.id, variantsFetched, variantsLoading],
  );

  const reloadVariants = useCallback(async () => {
    await loadVariants(true);
  }, [loadVariants]);

  const ensureVariants = (section: ProductEditSection) => {
    if (section === "colors" || section === "variants") {
      void loadVariants();
    }
  };

  const signalBlockedEdit = useCallback(() => {
    setBlockedHint((count) => count + 1);
  }, []);

  useEffect(() => {
    if (!sectionBusy) {
      setBlockedHint(0);
    }
  }, [sectionBusy]);

  const handleSectionToggle = (section: ProductEditSection) => {
    if (sectionBusy) {
      signalBlockedEdit();
      return;
    }
    const next = activeSection === section ? null : section;
    setActiveSection(next);
    if (next) ensureVariants(next);
  };

  const openSection = (section: ProductEditSection) => {
    if (variantBusy && section !== "variants") {
      signalBlockedEdit();
      return;
    }
    if (colorBusy && section !== "colors") {
      signalBlockedEdit();
      return;
    }
    setActiveSection(section);
    ensureVariants(section);
  };

  return (
    <div className="space-y-6">
      <ProductEditForm
        product={product}
        open={activeSection === "product"}
        onToggle={() => handleSectionToggle("product")}
        disabled={sectionBusy}
        onBlockedToggle={sectionBusy ? signalBlockedEdit : undefined}
      />

      <ProductColorsCard
        productId={product.id}
        variants={variants}
        variantsLoading={variantsLoading}
        variantsFetched={variantsFetched}
        variantsError={variantsError}
        onVariantsReload={reloadVariants}
        open={activeSection === "colors"}
        onToggle={() => handleSectionToggle("colors")}
        onOpen={() => openSection("colors")}
        disabled={sectionBusy}
        onBusyChange={setColorBusy}
        onBlockedToggle={sectionBusy ? signalBlockedEdit : undefined}
        blockedHint={colorBusy ? blockedHint : 0}
      />

      <VariantManager
        productId={product.id}
        variants={variants}
        variantsLoading={variantsLoading}
        variantsFetched={variantsFetched}
        variantsError={variantsError}
        onVariantsReload={reloadVariants}
        open={activeSection === "variants"}
        onToggle={() => handleSectionToggle("variants")}
        onOpen={() => openSection("variants")}
        accordionLocked={sectionBusy}
        onBusyChange={setVariantBusy}
        onBlockedToggle={sectionBusy ? signalBlockedEdit : undefined}
        blockedHint={variantBusy ? blockedHint : 0}
      />
    </div>
  );
}
