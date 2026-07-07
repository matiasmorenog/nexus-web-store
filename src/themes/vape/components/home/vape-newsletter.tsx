"use client";

import { FormEvent } from "react";
import { VapeButton } from "@/themes/vape/components/vape-button";

export function VapeNewsletter() {
  const submit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <section className="border-t border-vape bg-[color-mix(in_srgb,var(--brand-primary-dark)_25%,transparent)]">
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[var(--brand-primary)]">
          Newsletter
        </p>
        <h2 className="font-vape-display text-2xl font-bold text-[var(--brand-primary-light,#f0f0f5)] sm:text-3xl">
          MANTENTE AL DÍA
        </h2>
        <p className="mt-3 text-sm text-vape-muted">
          Nuevos productos, ofertas exclusivas y consejos de expertos directo a tu correo.
        </p>
        <form onSubmit={submit} className="mx-auto mt-6 flex max-w-sm gap-2">
          <input
            type="email"
            placeholder="tu@email.com"
            className="flex-1 rounded-[var(--ui-button-radius)] border border-vape bg-[var(--brand-primary-mid)] px-4 py-2.5 text-sm text-[var(--brand-primary-light,#f0f0f5)] placeholder:text-vape-muted focus:border-[color-mix(in_srgb,var(--brand-primary)_50%,transparent)] focus:outline-none"
          />
          <VapeButton type="submit" variant="primary" size="md">
            Unirme
          </VapeButton>
        </form>
      </div>
    </section>
  );
}
