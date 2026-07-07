type ProductJsonLdProps = {
  name: string;
  description: string;
  image?: string;
  url: string;
  price: number;
  currency?: string;
  inStock: boolean;
};

export function ProductJsonLd({
  name,
  description,
  image,
  url,
  price,
  currency = "ARS",
  inStock,
}: ProductJsonLdProps) {
  const payload = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: image ? [image] : undefined,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: currency,
      price: price.toFixed(2),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
