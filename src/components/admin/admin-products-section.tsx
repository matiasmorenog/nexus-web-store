"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminLoadMore } from "@/components/admin/admin-load-more";
import { ProductThumbnail } from "@/components/admin/product-thumbnail";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { ProductCreateForm } from "@/components/admin/product-create-form";
import {
  AdminDataTable,
  AdminTableActions,
  AdminTableCell,
  AdminTableEmpty,
  AdminTableIconAction,
  AdminTableRow,
} from "@/components/admin/admin-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getAdminProductsCopy,
  readAdminLocaleFromDocument,
} from "@/lib/admin-locale";
import { getProductTaxonomyLabel } from "@/lib/categories";
import type { AdminProductsFilterParams } from "@/lib/admin-products-query";
import type { ProductCategoryDef } from "@/lib/store-verticals/types";
import { cn, formatPrice } from "@/lib/utils";

export type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
  audience: string;
  featured: boolean;
  promo2x1: boolean;
  variants: { imageUrl: string; price: number }[];
  _count: { variants: number };
};

type AdminProductsSectionProps = {
  initialProducts: AdminProductRow[];
  total: number;
  hasMore: boolean;
  filters: AdminProductsFilterParams;
  /** Sin filtros activos: no se cargó el listado desde la DB. */
  awaitingFilters?: boolean;
  /** 2x1 disponible: vertical con promo + módulo coupons activo. */
  promo2x1Selectable?: boolean;
  canManage?: boolean;
  categories?: readonly ProductCategoryDef[];
};

export function AdminProductsSection({
  initialProducts,
  total,
  hasMore: initialHasMore,
  filters,
  awaitingFilters = false,
  promo2x1Selectable = false,
  canManage = true,
  categories,
}: AdminProductsSectionProps) {
  const copy = getAdminProductsCopy(readAdminLocaleFromDocument());
  const productColumns = [
    copy.columns.product,
    copy.columns.category,
    copy.columns.price,
    copy.columns.variants,
    copy.columns.status,
    copy.columns.actions,
  ] as const;

  const [createOpen, setCreateOpen] = useState(false);
  const [blockedHint, setBlockedHint] = useState(0);
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [prevListSeed, setPrevListSeed] = useState({
    initialProducts,
    initialHasMore,
  });

  if (
    initialProducts !== prevListSeed.initialProducts ||
    initialHasMore !== prevListSeed.initialHasMore
  ) {
    setPrevListSeed({ initialProducts, initialHasMore });
    setProducts(initialProducts);
    setPage(1);
    setHasMore(initialHasMore);
  }

  const signalBlockedCreate = useCallback(() => {
    setBlockedHint((count) => count + 1);
  }, []);

  const handleCreateOpenChange = (open: boolean) => {
    setCreateOpen(open);
    if (!open) {
      setBlockedHint(0);
    }
  };

  const loadMore = async () => {
    if (loading || !hasMore || awaitingFilters) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
      });

      if (filters.q?.trim()) params.set("q", filters.q.trim());
      if (filters.categoria) params.set("categoria", filters.categoria);
      if (filters.genero) params.set("genero", filters.genero);
      if (filters.estado) params.set("estado", filters.estado);
      if (filters.stock) params.set("stock", filters.stock);
      if (filters.orden && filters.orden !== "recientes") {
        params.set("orden", filters.orden);
      }

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? copy.loadError);
      }

      setProducts((current) => [...current, ...data.products]);
      setPage(data.page);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const catalogDescription = awaitingFilters
    ? copy.catalogAwaitingDescription
    : hasMore || products.length < total
      ? copy.catalogCountPartial(products.length, total)
      : copy.catalogCountAll(total);

  return (
    <div className="space-y-6 pb-2">
      <AdminDashboardReveal index={0} className="space-y-6">
        {createOpen && canManage ? (
          <ProductCreateForm
            onClose={() => handleCreateOpenChange(false)}
            blockedHint={blockedHint}
            promo2x1Selectable={promo2x1Selectable}
            categories={categories}
          />
        ) : null}

        <div
          className={cn(
            createOpen &&
              "[&_h2]:text-neutral-400 [&_p]:text-neutral-400 [&_a]:cursor-not-allowed [&_a]:opacity-50 [&_button]:cursor-not-allowed [&_button]:opacity-50",
          )}
          onClickCapture={
            createOpen
              ? (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  signalBlockedCreate();
                }
              : undefined
          }
        >
          <AdminCard
            title={copy.catalogTitle}
            className={cn(createOpen && "bg-neutral-100/50")}
            description={catalogDescription}
            padding={false}
            action={
              canManage && !createOpen ? (
                <Button
                  size="sm"
                  className="w-full whitespace-nowrap sm:w-auto"
                  onClick={() => handleCreateOpenChange(true)}
                >
                  {copy.newProduct}
                </Button>
              ) : undefined
            }
          >
            <AdminDataTable columns={[...productColumns]}>
            {products.length === 0 ? (
              <AdminTableEmpty colSpan={productColumns.length}>
                {awaitingFilters
                  ? copy.catalogEmptyAwaiting
                  : copy.catalogEmptyNoProducts}
              </AdminTableEmpty>
            ) : (
              products.map((product) => (
              <AdminTableRow key={product.id}>
                <AdminTableCell>
                  <div className="flex items-center gap-3">
                    <ProductThumbnail
                      src={product.variants[0]?.imageUrl}
                      alt={product.name}
                    />
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <Link
                        href={`/producto/${product.slug}`}
                        className="text-xs text-neutral-500 hover:underline"
                        target="_blank"
                      >
                        {copy.viewInStore}
                      </Link>
                    </div>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  {getProductTaxonomyLabel(
                    product.category,
                    product.audience,
                    categories,
                  )}
                </AdminTableCell>
                <AdminTableCell className="font-medium">
                  {formatPrice(Number(product.variants[0]?.price ?? 0))}
                </AdminTableCell>
                <AdminTableCell>{product._count.variants}</AdminTableCell>
                <AdminTableCell>
                  <div className="flex flex-wrap gap-1">
                    {product.promo2x1 && (
                      <Badge variant="success">{copy.statusPromo2x1}</Badge>
                    )}
                    {product.featured ? (
                      <Badge variant="success">{copy.statusFeatured}</Badge>
                    ) : (
                      !product.promo2x1 && (
                        <Badge>{copy.statusNormal}</Badge>
                      )
                    )}
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <AdminTableActions>
                    <AdminTableIconAction
                      label={copy.editProductAria(product.name)}
                      icon={Pencil}
                      href={`/admin/productos/${product.id}/edit`}
                    />
                    {canManage ? (
                      <DeleteProductButton
                        productId={product.id}
                        productName={product.name}
                      />
                    ) : null}
                  </AdminTableActions>
                </AdminTableCell>
              </AdminTableRow>
            ))
            )}
          </AdminDataTable>

          <AdminLoadMore
            loaded={products.length}
            total={total}
            hasMore={hasMore && !awaitingFilters}
            loading={loading}
            onLoadMore={loadMore}
            label={copy.loadMore}
            loadingLabel={copy.loading}
            showingLabel={copy.showingOf(products.length, total)}
          />
          </AdminCard>
        </div>
      </AdminDashboardReveal>
    </div>
  );
}
