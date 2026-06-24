import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/storefront/add-to-cart";
import { InfoSections } from "@/components/storefront/info-sections";
import { ProductImage } from "@/components/storefront/product-image";
import { StorefrontReveal } from "@/components/storefront/storefront-reveal";
import { getProductTaxonomyLabel } from "@/lib/categories";
import { INFO_PAGES, resolvePageContent } from "@/lib/info-pages";
import {
  getStorefrontProduct,
  getStorefrontProductSlugs,
} from "@/lib/product-page-query";
import { STOREFRONT_CATALOG_REVALIDATE_SECONDS } from "@/lib/cache-ttl";
import { formatStoreName, getStore, getStoreId } from "@/lib/store-context";

export const revalidate = STOREFRONT_CATALOG_REVALIDATE_SECONDS;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const storeId = await getStoreId();
    const products = await getStorefrontProductSlugs(storeId);
    return products.map((product) => ({ slug: product.slug }));
  } catch {
    return [];
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const store = await getStore();
  const storeId = store.id;
  const displayName = formatStoreName(store.name);
  const sizeGuide = resolvePageContent(INFO_PAGES["guia-de-talles"], displayName);

  const product = await getStorefrontProduct(storeId, slug);

  if (!product) notFound();

  const mainImage = product.variants[0]?.imageUrl ?? "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <StorefrontReveal index={0}>
        <nav className="mb-6 text-sm text-neutral-500">
          <Link href="/productos" className="transition-colors hover:text-[var(--brand-primary)]">
            Catálogo
          </Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-900">{product.name}</span>
        </nav>
      </StorefrontReveal>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <StorefrontReveal index={1}>
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-neutral-100 ring-1 ring-neutral-200/60">
            <ProductImage
              src={mainImage}
              alt={product.name}
              priority
            />
          </div>
        </StorefrontReveal>
        <StorefrontReveal index={2} className="lg:py-2">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--brand-primary)]">
            {getProductTaxonomyLabel(product.category, product.audience)}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 leading-relaxed text-neutral-600">
            {product.description}
          </p>
          <div className="mt-8 rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-6">
            <AddToCart
              productId={product.id}
              productName={product.name}
              productSlug={product.slug}
              promo2x1={product.promo2x1}
              showSizeGuideLink={product.category !== "accesorios"}
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
        </StorefrontReveal>
      </div>

      {product.category !== "accesorios" && sizeGuide.kind === "info" && (
        <StorefrontReveal index={3} className="mt-12 lg:mt-16">
          <section id="size-guide" aria-labelledby="size-guide-heading" className="scroll-mt-28">
            <h2
              id="size-guide-heading"
              className="text-2xl font-bold tracking-tight text-neutral-900"
            >
              {sizeGuide.title}
            </h2>
            <p className="mt-2 max-w-2xl text-neutral-600">{sizeGuide.description}</p>
            <div className="mt-6 rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-6">
              <InfoSections sections={sizeGuide.sections} />
            </div>
          </section>
        </StorefrontReveal>
      )}
    </div>
  );
}
