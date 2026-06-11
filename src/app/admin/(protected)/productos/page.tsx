import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
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

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Producto</th>
              <th className="px-4 py-3 text-left font-medium">Categoría</th>
              <th className="px-4 py-3 text-left font-medium">Precio</th>
              <th className="px-4 py-3 text-left font-medium">Variantes</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
              <th className="px-4 py-3 text-left font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3">
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
                <td className="px-4 py-3">
                  {getCategoryLabel(product.category)}
                </td>
                <td className="px-4 py-3">
                  {formatPrice(Number(product.variants[0]?.price ?? 0))}
                </td>
                <td className="px-4 py-3">{product._count.variants}</td>
                <td className="px-4 py-3">
                  {product.featured ? (
                    <Badge variant="success">Destacado</Badge>
                  ) : (
                    <Badge>Normal</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/admin/productos/${product.id}/edit`}>
                      <Button size="sm" variant="secondary">
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
    </div>
  );
}
