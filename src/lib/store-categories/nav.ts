import type { HeaderNavLink } from "@/lib/store-verticals/nav";

export type StoreNavCategory = {
  slug: string;
  label: string;
  showInNav: boolean;
};

/**
 * Actualiza links `categoria` del template con DB (showInNav + label).
 * Solo agrega slugs nuevos si el template ya incluye al menos un link
 * `categoria` (allowlist explícito del vertical). Sin ellos, no inyecta
 * el catálogo entero en el header.
 */
export function applyStoreCategoriesToHeaderNav(
  links: readonly HeaderNavLink[],
  categories: readonly StoreNavCategory[],
): HeaderNavLink[] {
  const bySlug = new Map(
    categories.map((category) => [category.slug, category] as const),
  );
  const seen = new Set<string>();
  const templateIncludesCategories = links.some(
    (link) => link.match.type === "categoria",
  );

  const rewritten: HeaderNavLink[] = [];
  for (const link of links) {
    if (link.match.type !== "categoria") {
      rewritten.push(link);
      continue;
    }

    const category = bySlug.get(link.match.slug);
    if (!category) {
      rewritten.push(link);
      seen.add(link.match.slug);
      continue;
    }

    seen.add(category.slug);
    if (!category.showInNav) continue;

    const catalogBase = link.href.split("?")[0] || "/productos";
    rewritten.push({
      ...link,
      label: category.label,
      href: `${catalogBase}?categoria=${category.slug}`,
    });
  }

  if (!templateIncludesCategories) return rewritten;

  const catalogBase =
    links.find((link) => link.match.type === "categoria")?.href.split("?")[0] ??
    "/productos";
  const extras = categories
    .filter((category) => category.showInNav && !seen.has(category.slug))
    .map(
      (category): HeaderNavLink => ({
        href: `${catalogBase}?categoria=${category.slug}`,
        label: category.label,
        match: { type: "categoria", slug: category.slug },
      }),
    );

  if (extras.length === 0) return rewritten;

  const promoIndex = rewritten.findIndex(
    (link) => link.match.type === "promo2x1",
  );
  if (promoIndex === -1) {
    return [...rewritten, ...extras];
  }

  return [
    ...rewritten.slice(0, promoIndex),
    ...extras,
    ...rewritten.slice(promoIndex),
  ];
}
