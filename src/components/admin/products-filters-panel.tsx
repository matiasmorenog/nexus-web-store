"use client";

import { useSearchParams } from "next/navigation";
import { AdminCard } from "@/components/admin/admin-card";
import {
  AdminClearFiltersButton,
  AdminFilterButton,
  AdminFilterSection,
} from "@/components/admin/admin-filters";
import { useAdminListNavigation } from "@/components/admin/use-admin-list-navigation";
import {
  getAdminProductsCopy,
  readAdminLocaleFromDocument,
} from "@/lib/admin-locale";
import { adminFiltersPanelScrollClass } from "@/lib/admin-list-layout";
import { hasAdminProductFacetFilters } from "@/lib/admin-product-filters";
import { PRODUCT_CATEGORIES, STORE_AUDIENCES } from "@/lib/categories";
import type { ProductCategoryDef } from "@/lib/store-verticals/types";
import { cn } from "@/lib/utils";

type ProductsFiltersPanelProps = {
  totalProducts: number;
  categoryCounts: Record<string, number>;
  audienceCounts: Record<string, number>;
  estadoCounts: {
    destacado: number;
    promo2x1: number;
    normal: number;
  };
  categories?: readonly ProductCategoryDef[];
  className?: string;
};

function audienceLabel(
  slug: string,
  copy: ReturnType<typeof getAdminProductsCopy>,
) {
  if (slug === "hombre") return copy.audienceHombre;
  if (slug === "mujer") return copy.audienceMujer;
  if (slug === "unisex") return copy.audienceUnisex;
  return slug;
}

export function ProductsFiltersPanel({
  totalProducts,
  categoryCounts,
  audienceCounts,
  estadoCounts,
  categories = PRODUCT_CATEGORIES,
  className,
}: ProductsFiltersPanelProps) {
  const searchParams = useSearchParams();
  const navigateCatalog = useAdminListNavigation();
  const copy = getAdminProductsCopy(readAdminLocaleFromDocument());

  const activeCategory = searchParams.get("categoria") ?? "";
  const activeAudience = searchParams.get("genero") ?? "";
  const activeEstado = searchParams.get("estado") ?? "";

  const navigate = (updates: {
    categoria?: string;
    genero?: string;
    estado?: string;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates.categoria !== undefined) {
      if (updates.categoria) params.set("categoria", updates.categoria);
      else params.delete("categoria");
    }

    if (updates.genero !== undefined) {
      if (updates.genero) params.set("genero", updates.genero);
      else params.delete("genero");
    }

    if (updates.estado !== undefined) {
      if (updates.estado) params.set("estado", updates.estado);
      else params.delete("estado");
    }

    const qs = params.toString();
    navigateCatalog(qs ? `/admin/productos?${qs}` : "/admin/productos");
  };

  const hasFacetFilters = hasAdminProductFacetFilters({
    categoria: activeCategory || undefined,
    genero: activeAudience || undefined,
    estado: activeEstado || undefined,
  });

  return (
    <div className={cn(adminFiltersPanelScrollClass, className)}>
      <AdminCard
        title={copy.filtersTitle}
        description={copy.filtersDescription}
        padding={false}
      >
        <AdminFilterSection
          title={copy.categorySection}
          activeKey={activeCategory || "__all__"}
        >
          <AdminFilterButton
            active={!activeCategory}
            label={copy.allFeminine}
            count={totalProducts}
            onClick={() => navigate({ categoria: "" })}
          />
          {categories.map((category) => (
            <AdminFilterButton
              key={category.slug}
              active={activeCategory === category.slug}
              label={category.label}
              count={categoryCounts[category.slug] ?? 0}
              onClick={() =>
                navigate({
                  categoria:
                    activeCategory === category.slug ? "" : category.slug,
                })
              }
            />
          ))}
        </AdminFilterSection>

        <AdminFilterSection
          title={copy.audienceSection}
          activeKey={activeAudience || "__all__"}
        >
          <AdminFilterButton
            active={!activeAudience}
            label={copy.allMasculine}
            count={totalProducts}
            onClick={() => navigate({ genero: "" })}
          />
          {STORE_AUDIENCES.map((audience) => (
            <AdminFilterButton
              key={audience.slug}
              active={activeAudience === audience.slug}
              label={audienceLabel(audience.slug, copy)}
              count={audienceCounts[audience.slug] ?? 0}
              onClick={() =>
                navigate({
                  genero:
                    activeAudience === audience.slug ? "" : audience.slug,
                })
              }
            />
          ))}
        </AdminFilterSection>

        <AdminFilterSection
          title={copy.statusSection}
          activeKey={activeEstado || "__all__"}
        >
          <AdminFilterButton
            active={!activeEstado}
            label={copy.allMasculine}
            count={totalProducts}
            onClick={() => navigate({ estado: "" })}
          />
          <AdminFilterButton
            active={activeEstado === "destacado"}
            label={copy.statusFeatured}
            count={estadoCounts.destacado}
            onClick={() =>
              navigate({
                estado: activeEstado === "destacado" ? "" : "destacado",
              })
            }
          />
          <AdminFilterButton
            active={activeEstado === "2x1"}
            label={copy.statusPromo2x1}
            count={estadoCounts.promo2x1}
            onClick={() =>
              navigate({ estado: activeEstado === "2x1" ? "" : "2x1" })
            }
          />
          <AdminFilterButton
            active={activeEstado === "normal"}
            label={copy.statusNormal}
            count={estadoCounts.normal}
            onClick={() =>
              navigate({ estado: activeEstado === "normal" ? "" : "normal" })
            }
          />
        </AdminFilterSection>

        {hasFacetFilters ? (
          <AdminClearFiltersButton
            label={copy.clearFilters}
            onClick={() =>
              navigate({ categoria: "", genero: "", estado: "" })
            }
          />
        ) : null}
      </AdminCard>
    </div>
  );
}
