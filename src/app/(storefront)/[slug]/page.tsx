import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactPage } from "@/components/storefront/contact-page";
import { InfoPage } from "@/components/storefront/info-page";
import {
  INFO_PAGE_SLUGS,
  getLocalizedInfoPage,
  isInfoPageSlug,
  resolvePageContent,
} from "@/lib/info-pages";
import { infoPageHref } from "@/lib/storefront-paths";
import { getMerchantEmail } from "@/lib/merchant-email";
import { formatStoreName, getStore } from "@/lib/store-context";
import { getStorefrontConfig } from "@/lib/store-verticals";

type PageProps = {
  params: Promise<{ slug: string }>;
};

/** ISR storefront — mantener en sync con STORE_CACHE_REVALIDATE_SECONDS en cache-ttl.ts */
export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    await getStore();
    return INFO_PAGE_SLUGS.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!isInfoPageSlug(slug)) {
    return {};
  }

  const store = await getStore();
  const displayName = formatStoreName(store.name);
  const config = getStorefrontConfig();
  const page = resolvePageContent(getLocalizedInfoPage(slug, config.locale), displayName);

  return {
    title: `${page.title} — ${displayName}`,
    description: page.description,
    alternates: { canonical: infoPageHref(slug) },
  };
}

export default async function StoreInfoPage({ params }: PageProps) {
  const { slug } = await params;

  if (!isInfoPageSlug(slug)) {
    notFound();
  }

  const store = await getStore();
  const displayName = formatStoreName(store.name);
  const config = getStorefrontConfig();
  const page = resolvePageContent(getLocalizedInfoPage(slug, config.locale), displayName);

  if (page.kind === "contact") {
    const email = await getMerchantEmail(store.id);
    return (
      <ContactPage
        page={page}
        email={email}
        storeName={displayName}
        locale={config.locale}
        allowPickup={store.allowPickup}
      />
    );
  }

  return <InfoPage page={page} />;
}
