import Link from "next/link";
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
        <div className="space-y-4 text-neutral-700">
          {page.sections.map((section, index) => {
            if (section.type === "heading") {
              return (
                <h2
                  key={index}
                  className="pt-2 text-lg font-semibold text-neutral-900 first:pt-0"
                >
                  {section.text}
                </h2>
              );
            }

            if (section.type === "list") {
              return (
                <ul key={index} className="list-disc space-y-2 pl-5 leading-relaxed">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              );
            }

            return (
              <p key={index} className="leading-relaxed">
                {section.text}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
