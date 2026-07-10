type StorefrontWebsiteJsonLdProps = {
  name: string;
  url: string;
  description: string;
};

export function StorefrontWebsiteJsonLd({
  name,
  url,
  description,
}: StorefrontWebsiteJsonLdProps) {
  const payload = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    description,
    inLanguage: "es-AR",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
