import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/storefront/add-to-cart";
import { InfoSections } from "@/components/storefront/info-sections";
import { ProductImage } from "@/components/storefront/product-image";
import { ProductJsonLd } from "@/components/storefront/product-json-ld";
import { WishlistButton } from "@/components/storefront/wishlist-button";
import { StorefrontReveal } from "@/components/storefront/storefront-reveal";
import { getProductTaxonomyLabel } from "@/lib/categories";
import { INFO_PAGES, resolvePageContent } from "@/lib/info-pages";
import {
  getStorefrontProduct,
  getStorefrontProductSlugs,
} from "@/lib/product-page-query";
import {
  buildSeoContext,
  buildStorefrontMetadata,
} from "@/lib/seo/build-metadata";
import { truncateMetaDescription } from "@/lib/seo/format";
import { getResolvedStoreSeoSettings } from "@/lib/seo/query";
import { storeHasModule } from "@/lib/modules";
import { formatStoreName, getStore, getStoreId } from "@/lib/store-context";
import { getStorefrontConfig } from "@/lib/store-verticals";
import { getVariantLabels } from "@/lib/variant-labels";

/** ISR storefront — mantener en sync con STOREFRONT_CATALOG_REVALIDATE_SECONDS en cache-ttl.ts */
export const revalidate = 600;

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

function getProductSeoOffer(product: Awaited<ReturnType<typeof getStorefrontProduct>>) {
  if (!product) {
    return { minPrice: 0, inStock: false, image: undefined as string | undefined };
  }

  const prices = product.variants
    .map((variant) => Number(variant.price))
    .filter((price) => price > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const inStock = product.variants.some((variant) => variant.stock > 0);
  const image = product.variants.find((variant) => variant.imageUrl)?.imageUrl;

  return { minPrice, inStock, image };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStore();
  const storeId = store.id;
  const config = getStorefrontConfig();
  const displayName = formatStoreName(store.name);
  const product = await getStorefrontProduct(storeId, slug);

  if (!product) {
    return {};
  }

  const seoSettings = await getResolvedStoreSeoSettings(storeId);
  const context = buildSeoContext(displayName, config.metadata.description);
  const { image } = getProductSeoOffer(product);

  return buildStorefrontMetadata(seoSettings, context, {
    title: product.name,
    description: product.description,
    path: `/producto/${product.slug}`,
    image,
    type: "product",
  });
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const store = await getStore();
  const storeId = store.id;
  const config = getStorefrontConfig();
  const variantLabels = getVariantLabels();
  const displayName = formatStoreName(store.name);
  const sizeGuide = resolvePageContent(INFO_PAGES["guia-de-talles"], displayName);

  const product = await getStorefrontProduct(storeId, slug);

  if (!product) notFound();

  const mainImage = product.variants[0]?.imageUrl ?? "";
  const catalogHref = config.features.catalog ? "/productos" : "/";
  const catalogLabel = config.features.catalog ? "Catálogo" : "Inicio";
  const showSizeGuide =
    config.features.sizeGuide && product.category !== "accesorios";
  const seoSettings = await getResolvedStoreSeoSettings(storeId);
  const seoContext = buildSeoContext(displayName, config.metadata.description);
  const { minPrice, inStock, image } = getProductSeoOffer(product);
  const productUrl = `${seoContext.siteUrl}/producto/${product.slug}`;
  const wishlistEnabled = await storeHasModule(storeId, "wishlist");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {seoSettings?.structuredDataEnabled ? (
        <ProductJsonLd
          name={product.name}
          description={truncateMetaDescription(product.description, 300)}
          image={image}
          url={productUrl}
          price={minPrice}
          inStock={inStock}
        />
      ) : null}
      <StorefrontReveal index={0}>
        <nav className="mb-6 text-sm text-neutral-500">
          <Link href={catalogHref} className="transition-colors hover:text-[var(--brand-primary)]">
            {catalogLabel}
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
          <div className="mt-2 flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              {product.name}
            </h1>
            {wishlistEnabled ? (
              <WishlistButton
                compact
                productId={product.id}
                productSlug={product.slug}
                productName={product.name}
                imageUrl={mainImage}
                minPrice={minPrice}
              />
            ) : null}
          </div>
          <p className="mt-4 leading-relaxed text-neutral-600">
            {product.description}
          </p>
          <div className="mt-8 rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-6">
            <AddToCart
              productId={product.id}
              productName={product.name}
              productSlug={product.slug}
              promo2x1={config.features.promo2x1 ? product.promo2x1 : false}
              showSizeGuideLink={showSizeGuide}
              variantLabels={variantLabels}
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

      {showSizeGuide && sizeGuide.kind === "info" && (
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
