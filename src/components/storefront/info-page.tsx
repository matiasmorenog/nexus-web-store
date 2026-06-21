import Link from "next/link";
import { InfoSections } from "@/components/storefront/info-sections";
import type { InfoPageContent } from "@/lib/info-pages";
import { StorefrontPageHeader } from "@/components/storefront/storefront-page-header";

type InfoPageProps = {
  page: InfoPageContent;
};

export function InfoPage({ page }: InfoPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-2 text-sm text-neutral-500">
        <Link href="/" className="transition-colors hover:text-[var(--brand-primary)]">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-900">{page.title}</span>
      </nav>

      <StorefrontPageHeader title={page.title} description={page.description} />

      <div className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-sm sm:p-8">
        <InfoSections sections={page.sections} />
      </div>
    </div>
  );
}
