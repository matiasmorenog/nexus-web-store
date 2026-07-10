import { getProductTaxonomyLabel } from "@/lib/categories";
import { toCsvContent, toCsvRow } from "@/lib/exports/csv";

type ProductVariantExport = {
  size: string;
  color: string;
  sku: string;
  stock: number;
  price: { toString(): string } | number;
};

type ProductExportRow = {
  name: string;
  slug: string;
  category: string;
  audience: string;
  featured: boolean;
  promo2x1: boolean;
  variants: ProductVariantExport[];
};

const PRODUCT_HEADERS = [
  "Producto",
  "Slug",
  "Categoría",
  "Audiencia",
  "Destacado",
  "2x1",
  "Variante talle",
  "Variante color",
  "SKU",
  "Precio",
  "Stock",
] as const;

export function buildProductsCsv(products: ProductExportRow[]): string {
  const rows = [toCsvRow([...PRODUCT_HEADERS])];

  for (const product of products) {
    const categoryLabel = getProductTaxonomyLabel(
      product.category,
      product.audience,
    );

    if (product.variants.length === 0) {
      rows.push(
        toCsvRow([
          product.name,
          product.slug,
          categoryLabel,
          product.audience,
          product.featured ? "Sí" : "No",
          product.promo2x1 ? "Sí" : "No",
          "",
          "",
          "",
          "",
          0,
        ]),
      );
      continue;
    }

    for (const variant of product.variants) {
      rows.push(
        toCsvRow([
          product.name,
          product.slug,
          categoryLabel,
          product.audience,
          product.featured ? "Sí" : "No",
          product.promo2x1 ? "Sí" : "No",
          variant.size,
          variant.color,
          variant.sku,
          Number(variant.price),
          variant.stock,
        ]),
      );
    }
  }

  return toCsvContent(rows);
}
