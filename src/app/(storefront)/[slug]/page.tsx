import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactPage } from "@/components/storefront/contact-page";
import { InfoPage } from "@/components/storefront/info-page";
import {
  INFO_PAGES,
  INFO_PAGE_SLUGS,
  isInfoPageSlug,
  resolvePageContent,
} from "@/lib/info-pages";
import { formatStoreName, getStore } from "@/lib/store-context";
import { getContactEmail } from "@/lib/store-env";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return INFO_PAGE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!isInfoPageSlug(slug)) {
    return {};
  }

  const store = await getStore();
  const displayName = formatStoreName(store.name);
  const page = resolvePageContent(INFO_PAGES[slug], displayName);

  return {
    title: `${page.title} — ${displayName}`,
    description: page.description,
  };
}

export default async function StoreInfoPage({ params }: PageProps) {
  const { slug } = await params;

  if (!isInfoPageSlug(slug)) {
    notFound();
  }

  const store = await getStore();
  const displayName = formatStoreName(store.name);
  const page = resolvePageContent(INFO_PAGES[slug], displayName);

  if (page.kind === "contact") {
    return (
      <ContactPage
        page={page}
        email={getContactEmail()}
        storeName={displayName}
      />
    );
  }

  return <InfoPage page={page} />;
}
