"use client";

import { FormEvent } from "react";
import type { NewsletterContent } from "@/lib/home-content/types";
import { App2Button } from "@/themes/app2/components/app2-button";

type App2NewsletterProps = {
  content: NewsletterContent;
};

export function App2Newsletter({ content }: App2NewsletterProps) {
  const submit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <section className="border-t border-app2 bg-[color-mix(in_srgb,var(--brand-primary-dark)_25%,transparent)]">
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[var(--brand-primary)]">
          {content.eyebrow}
        </p>
        <h2 className="font-app2-display text-2xl font-bold text-[var(--brand-primary-light,#f0f0f5)] sm:text-3xl">
          {content.title}
        </h2>
        <p className="mt-3 text-sm text-app2-muted">{content.description}</p>
        <form onSubmit={submit} className="mx-auto mt-6 flex max-w-sm gap-2">
          <input
            type="email"
            placeholder={content.placeholder}
            className="flex-1 rounded-[var(--ui-button-radius)] border border-app2 bg-[var(--brand-primary-mid)] px-4 py-2.5 text-sm text-[var(--brand-primary-light,#f0f0f5)] placeholder:text-app2-muted focus:border-[color-mix(in_srgb,var(--brand-primary)_50%,transparent)] focus:outline-none"
          />
          <App2Button type="submit" variant="primary" size="md">
            {content.buttonLabel}
          </App2Button>
        </form>
      </div>
    </section>
  );
}
