import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/storefront/add-to-cart";
import { getCategoryLabel } from "@/lib/categories";
import { db } from "@/lib/db";
import { getStoreId } from "@/lib/store-context";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const storeId = await getStoreId();

  const product = await db.product.findFirst({
    where: { storeId, slug },
    include: { variants: { orderBy: [{ color: "asc" }, { size: "asc" }] } },
  });

  if (!product) notFound();

  const mainImage = product.variants[0]?.imageUrl ?? "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-neutral-100">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
        <div>
          <p className="text-sm uppercase tracking-wide text-neutral-500">
            {getCategoryLabel(product.category)}
          </p>
          <h1 className="mt-1 text-3xl font-bold">{product.name}</h1>
          <p className="mt-4 text-neutral-600 leading-relaxed">{product.description}</p>
          <div className="mt-8">
            <AddToCart
              productId={product.id}
              productName={product.name}
              productSlug={product.slug}
              variants={product.variants.map((v) => ({
                id: v.id,
                size: v.size,
                color: v.color,
                stock: v.stock,
                price: Number(v.price),
                imageUrl: v.imageUrl,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
