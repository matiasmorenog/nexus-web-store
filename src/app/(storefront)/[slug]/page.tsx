import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactPage } from "@/components/storefront/contact-page";
import { InfoPage } from "@/components/storefront/info-page";
import {
  INFO_PAGES,
  INFO_PAGE_SLUGS,
  getContactEmail,
  isInfoPageSlug,
} from "@/lib/info-pages";
import { getStore } from "@/lib/store-context";

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

  const page = INFO_PAGES[slug];
  const store = await getStore();

  return {
    title: `${page.title} — ${store.name}`,
    description: page.description,
  };
}

export default async function StoreInfoPage({ params }: PageProps) {
  const { slug } = await params;

  if (!isInfoPageSlug(slug)) {
    notFound();
  }

  const page = INFO_PAGES[slug];
  const store = await getStore();

  if (page.kind === "contact") {
    return (
      <ContactPage
        page={page}
        email={getContactEmail()}
        storeName={store.name}
      />
    );
  }

  return <InfoPage page={page} />;
}
