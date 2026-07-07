import type { ReactNode } from "react";
import { ProductCard } from "@/components/storefront/product-card";
import { VapeProductCard } from "@/themes/vape/components/home/vape-product-card";
import type { CatalogProductRow } from "@/lib/catalog-index";
import { getProductTaxonomyLabel } from "@/lib/categories";
import type { StoreVertical } from "@/lib/store-verticals/types";

export function renderCatalogProductCard(
  vertical: StoreVertical,
  product: CatalogProductRow,
): ReactNode {
  if (vertical === "vape") {
    return (
      <VapeProductCard
        {...product}
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
      promo2x1={product.promo2x1}
    />
  );
}
