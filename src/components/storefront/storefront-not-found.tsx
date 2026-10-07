import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatStoreName, getStore } from "@/lib/store-context";
import { getStorefrontConfig } from "@/lib/store-verticals";
import { getStorefrontCopy } from "@/lib/storefront-copy";
import { getStorefrontPaths } from "@/lib/storefront-paths";

type StorefrontNotFoundProps = {
  variant?: "page" | "product";
};

/** Shared 404 for every store: logo mark, name and generic copy; colors come from the store brand. */
export async function StorefrontNotFound({ variant = "page" }: StorefrontNotFoundProps) {
  const store = await getStore();
  const config = getStorefrontConfig();
  const copy = getStorefrontCopy();
  const paths = getStorefrontPaths();
  const storeName = formatStoreName(store.name);
  const accent =
    store.primaryColor?.trim() || config.ui.cssVars["--brand-primary"] || "#171717";

  const title =
    variant === "product" ? copy.productUnavailableTitle : copy.notFoundTitle;
  const body =
    variant === "product" ? copy.productUnavailableBody : copy.notFoundBody;

  return (
    <section
      className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-20 text-center"
      style={{ "--not-found-accent": accent } as CSSProperties}
    >
      <Image
        src="/apple-icon"
        alt={storeName}
        width={72}
        height={72}
        unoptimized
        className="rounded-2xl shadow-sm"
      />
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] opacity-60">
        {storeName}
      </p>
      {variant === "page" ? (
        <p
          className="mt-8 text-6xl font-bold leading-none tracking-tight sm:text-7xl"
          style={{ color: "var(--not-found-accent)" }}
        >
          404
        </p>
      ) : null}
      <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed opacity-70 sm:text-base">
        {body}
      </p>
      <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link
          href={paths.catalog}
          className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--not-found-accent)" }}
        >
          {copy.viewProducts}
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border px-6 py-3 text-sm font-semibold transition-colors hover:bg-black/5"
          style={{ borderColor: "var(--not-found-accent)", color: "var(--not-found-accent)" }}
        >
          {copy.backHome}
        </Link>
      </div>
    </section>
  );
}
