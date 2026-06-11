import Link from "next/link";
import type { InfoPageContent } from "@/lib/info-pages";

type InfoPageProps = {
  page: InfoPageContent;
};

export function InfoPage({ page }: InfoPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-6 text-sm text-neutral-500">
        <Link href="/" className="transition-colors hover:text-[var(--brand-primary)]">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-900">{page.title}</span>
      </nav>

      <h1 className="text-3xl font-bold">
        <span className="inline-block border-b-2 border-[var(--brand-primary)] pb-1">
          {page.title}
        </span>
      </h1>
      <p className="mt-3 text-neutral-600">{page.description}</p>

      <div className="prose-neutral mt-8 space-y-4 text-neutral-700">
        {page.sections.map((section, index) => {
          if (section.type === "heading") {
            return (
              <h2
                key={index}
                className="pt-4 text-lg font-semibold text-neutral-900 first:pt-0"
              >
                {section.text}
              </h2>
            );
          }

          if (section.type === "list") {
            return (
              <ul key={index} className="list-disc space-y-2 pl-5">
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
  );
}
