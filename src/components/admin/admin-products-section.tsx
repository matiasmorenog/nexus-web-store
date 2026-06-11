"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { ProductCreateForm } from "@/components/admin/product-create-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCategoryLabel } from "@/lib/categories";
import { formatPrice } from "@/lib/utils";

export type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
  featured: boolean;
  variants: { imageUrl: string; price: number }[];
  _count: { variants: number };
};

type AdminProductsSectionProps = {
  products: AdminProductRow[];
};

export function AdminProductsSection({ products }: AdminProductsSectionProps) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Productos"
        description="Alta, edición y variantes de tu catálogo."
      />

      {createOpen ? (
        <ProductCreateForm onClose={() => setCreateOpen(false)} />
      ) : null}

      <AdminCard
        title="Catálogo"
        description={`${products.length} producto${products.length !== 1 ? "s" : ""}`}
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-100 bg-neutral-50/80">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-neutral-600">
                  Producto
                </th>
                <th className="px-6 py-3 text-left font-medium text-neutral-600">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left font-medium text-neutral-600">
                  Precio
                </th>
                <th className="px-6 py-3 text-left font-medium text-neutral-600">
                  Variantes
                </th>
                <th className="px-6 py-3 text-left font-medium text-neutral-600">
                  Estado
                </th>
                <th className="px-6 py-3 text-left font-medium text-neutral-600">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-neutral-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-8 overflow-hidden rounded bg-neutral-100">
                        {product.variants[0] ? (
                          <Image
                            src={product.variants[0].imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        ) : null}
                      </div>
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
                  </td>
                  <td className="px-6 py-4">
                    {getCategoryLabel(product.category)}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {formatPrice(Number(product.variants[0]?.price ?? 0))}
                  </td>
                  <td className="px-6 py-4">{product._count.variants}</td>
                  <td className="px-6 py-4">
                    {product.featured ? (
                      <Badge variant="success">Destacado</Badge>
                    ) : (
                      <Badge>Normal</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link href={`/admin/productos/${product.id}/edit`}>
                        <Button size="sm" variant="outline">
                          Editar
                        </Button>
                      </Link>
                      <DeleteProductButton productId={product.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
