import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProductEditSections } from "@/components/admin/product-edit-sections";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const session = await auth();
  const storeId = session?.user?.storeId;

  if (!storeId) return <p>No autorizado</p>;

  const product = await db.product.findFirst({
    where: { id: productId, storeId },
  });

  if (!product) notFound();

  return (
    <div className="space-y-6 pb-8">
      <div>
        <Link
          href="/admin/productos"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-[var(--brand-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a productos
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          <span className="inline-block border-b-2 border-[var(--brand-primary)] pb-0.5">
            {product.name}
          </span>
        </h1>
        <Link
          href={`/producto/${product.slug}`}
          target="_blank"
          className="mt-2 inline-block text-sm text-neutral-500 transition-colors hover:text-[var(--brand-primary)]"
        >
          Ver en tienda →
        </Link>
      </div>

      <ProductEditSections
        product={{
          id: product.id,
          name: product.name,
          description: product.description,
          category: product.category,
          audience: product.audience,
          featured: product.featured,
          promo2x1: product.promo2x1,
        }}
      />
    </div>
  );
}
