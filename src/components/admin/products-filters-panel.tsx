"use client";

import { useSearchParams } from "next/navigation";
import { AdminCard } from "@/components/admin/admin-card";
import {
  AdminClearFiltersButton,
  AdminFilterButton,
  AdminFilterSection,
} from "@/components/admin/admin-filters";
import { useAdminListNavigation } from "@/components/admin/use-admin-list-navigation";
import { adminFiltersPanelScrollClass } from "@/lib/admin-list-layout";
import { hasAdminProductFacetFilters } from "@/lib/admin-product-filters";
import { PRODUCT_CATEGORIES, STORE_AUDIENCES } from "@/lib/categories";
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
  className?: string;
};

export function ProductsFiltersPanel({
  totalProducts,
  categoryCounts,
  audienceCounts,
  estadoCounts,
  className,
}: ProductsFiltersPanelProps) {
  const searchParams = useSearchParams();
  const navigateCatalog = useAdminListNavigation();

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
      <AdminCard title="Filtros" description="Categoría, público y estado." padding={false}>
        <AdminFilterSection title="Categoría">
          <AdminFilterButton
            active={!activeCategory}
            label="Todas"
            count={totalProducts}
            onClick={() => navigate({ categoria: "" })}
          />
          {PRODUCT_CATEGORIES.map((category) => (
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

        <AdminFilterSection title="Público">
          <AdminFilterButton
            active={!activeAudience}
            label="Todos"
            count={totalProducts}
            onClick={() => navigate({ genero: "" })}
          />
          {STORE_AUDIENCES.map((audience) => (
            <AdminFilterButton
              key={audience.slug}
              active={activeAudience === audience.slug}
              label={audience.label}
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

        <AdminFilterSection title="Estado">
          <AdminFilterButton
            active={!activeEstado}
            label="Todos"
            count={totalProducts}
            onClick={() => navigate({ estado: "" })}
          />
          <AdminFilterButton
            active={activeEstado === "destacado"}
            label="Destacado"
            count={estadoCounts.destacado}
            onClick={() =>
              navigate({
                estado: activeEstado === "destacado" ? "" : "destacado",
              })
            }
          />
          <AdminFilterButton
            active={activeEstado === "2x1"}
            label="2x1"
            count={estadoCounts.promo2x1}
            onClick={() =>
              navigate({ estado: activeEstado === "2x1" ? "" : "2x1" })
            }
          />
          <AdminFilterButton
            active={activeEstado === "normal"}
            label="Normal"
            count={estadoCounts.normal}
            onClick={() =>
              navigate({ estado: activeEstado === "normal" ? "" : "normal" })
            }
          />
        </AdminFilterSection>

        {hasFacetFilters ? (
          <AdminClearFiltersButton
            onClick={() =>
              navigate({ categoria: "", genero: "", estado: "" })
            }
          />
        ) : null}
      </AdminCard>
    </div>
  );
}
