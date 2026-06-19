"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminLoadMore } from "@/components/admin/admin-load-more";
import { ProductThumbnail } from "@/components/admin/product-thumbnail";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
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
import { getProductTaxonomyLabel } from "@/lib/categories";
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

const PRODUCT_COLUMNS = [
  "Producto",
  "Categoría",
  "Precio",
  "Variantes",
  "Estado",
  "Acciones",
] as const;

type AdminProductsSectionProps = {
  initialProducts: AdminProductRow[];
  total: number;
  hasMore: boolean;
};

export function AdminProductsSection({
  initialProducts,
  total,
  hasMore: initialHasMore,
}: AdminProductsSectionProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [blockedHint, setBlockedHint] = useState(0);
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setProducts(initialProducts);
    setPage(1);
    setHasMore(initialHasMore);
  }, [initialProducts, initialHasMore]);

  const signalBlockedCreate = useCallback(() => {
    setBlockedHint((count) => count + 1);
  }, []);

  useEffect(() => {
    if (!createOpen) {
      setBlockedHint(0);
    }
  }, [createOpen]);

  const loadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products?page=${page + 1}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Error al cargar productos");
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

  return (
    <div className="space-y-6 pb-2">
      <AdminDashboardReveal index={0}>
        <AdminPageHeader
          title="Productos"
          description="Alta, edición y variantes de tu catálogo."
        />
      </AdminDashboardReveal>

      <AdminDashboardReveal index={1} className="space-y-6">
        {createOpen ? (
          <ProductCreateForm
            onClose={() => setCreateOpen(false)}
            blockedHint={blockedHint}
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
            title="Catálogo"
            className={cn(createOpen && "bg-neutral-100/50")}
            description={
              hasMore || products.length < total
                ? `${products.length} de ${total} producto${total !== 1 ? "s" : ""}`
                : `${total} producto${total !== 1 ? "s" : ""}`
            }
            padding={false}
            action={
              !createOpen ? (
                <Button
                  size="sm"
                  className="w-full whitespace-nowrap sm:w-auto"
                  onClick={() => setCreateOpen(true)}
                >
                  Nuevo producto
                </Button>
              ) : undefined
            }
          >
            <AdminDataTable columns={[...PRODUCT_COLUMNS]}>
            {products.length === 0 ? (
              <AdminTableEmpty colSpan={PRODUCT_COLUMNS.length}>
                No hay productos en el catálogo. Creá el primero con «Nuevo
                producto».
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
                        Ver en tienda
                      </Link>
                    </div>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  {getProductTaxonomyLabel(product.category, product.audience)}
                </AdminTableCell>
                <AdminTableCell className="font-medium">
                  {formatPrice(Number(product.variants[0]?.price ?? 0))}
                </AdminTableCell>
                <AdminTableCell>{product._count.variants}</AdminTableCell>
                <AdminTableCell>
                  <div className="flex flex-wrap gap-1">
                    {product.promo2x1 && <Badge variant="success">2x1</Badge>}
                    {product.featured ? (
                      <Badge variant="success">Destacado</Badge>
                    ) : (
                      !product.promo2x1 && <Badge>Normal</Badge>
                    )}
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <AdminTableActions>
                    <AdminTableIconAction
                      label={`Editar ${product.name}`}
                      icon={Pencil}
                      href={`/admin/productos/${product.id}/edit`}
                    />
                    <DeleteProductButton
                      productId={product.id}
                      productName={product.name}
                    />
                  </AdminTableActions>
                </AdminTableCell>
              </AdminTableRow>
            ))
            )}
          </AdminDataTable>

          <AdminLoadMore
            loaded={products.length}
            total={total}
            hasMore={hasMore}
            loading={loading}
            onLoadMore={loadMore}
            label="Cargar más productos"
          />
          </AdminCard>
        </div>
      </AdminDashboardReveal>
    </div>
  );
}
