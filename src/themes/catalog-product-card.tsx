import type { ReactNode } from "react";
import { ProductCard } from "@/components/storefront/product-card";
import { VapeProductCard } from "@/themes/vape/components/home/vape-product-card";
import type { CatalogProductRow } from "@/lib/catalog-index";
import { getProductTaxonomyLabel } from "@/lib/categories";
import type { StoreVertical } from "@/lib/store-verticals/types";

export function renderCatalogProductCard(
  vertical: StoreVertical,
  product: CatalogProductRow,
  promo2x1Active = false,
): ReactNode {
  const showPromo2x1 = promo2x1Active && product.promo2x1;

  if (vertical === "vape") {
    return (
      <VapeProductCard
        {...product}
        promo2x1={showPromo2x1}
        categoryLabel={getProductTaxonomyLabel(
          product.category,
          product.audience,
        )}
      />
    );
  }

  return (
    <ProductCard
      slug={product.slug}
      name={product.name}
      category={product.category}
      audience={product.audience}
      imageUrl={product.imageUrl}
      hoverImageUrl={product.hoverImageUrl}
      price={product.price}
      inStock={product.inStock}
      promo2x1={showPromo2x1}
    />
  );
}
