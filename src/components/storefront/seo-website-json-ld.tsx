type StorefrontWebsiteJsonLdProps = {
  name: string;
  url: string;
  description: string;
  language?: string;
};

export function StorefrontWebsiteJsonLd({
  name,
  url,
  description,
  language = "es-AR",
}: StorefrontWebsiteJsonLdProps) {
  const payload = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    description,
    inLanguage: language,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
