import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { AdminCard } from "@/components/admin/admin-card";
import { ProductForm } from "@/components/admin/product-form";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCategoryLabel } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const session = await auth();
  const storeId = session?.user?.storeId;

  if (!storeId) return <p>No autorizado</p>;

  const products = await db.product.findMany({
    where: { storeId },
    include: {
      variants: { orderBy: { price: "asc" }, take: 1 },
      _count: { select: { variants: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <ProductForm />

      <AdminCard title="Catálogo" description={`${products.length} producto${products.length !== 1 ? "s" : ""}`} padding={false}>
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-100 bg-neutral-50/80">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-neutral-600">Producto</th>
              <th className="px-6 py-3 text-left font-medium text-neutral-600">Categoría</th>
              <th className="px-6 py-3 text-left font-medium text-neutral-600">Precio</th>
              <th className="px-6 py-3 text-left font-medium text-neutral-600">Variantes</th>
              <th className="px-6 py-3 text-left font-medium text-neutral-600">Estado</th>
              <th className="px-6 py-3 text-left font-medium text-neutral-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-neutral-50/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-8 overflow-hidden rounded bg-neutral-100">
                      {product.variants[0] && (
                        <Image
                          src={product.variants[0].imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <Link
                        href={`/producto/${product.slug}`}
                        className="text-xs text-neutral-500 hover:underline"
                        target="_blank">
                        Ver en tienda
                      </Link>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">{getCategoryLabel(product.category)}</td>
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
