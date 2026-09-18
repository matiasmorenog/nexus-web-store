import type { HeaderNavLink } from "@/lib/store-verticals/nav";

export type StoreNavCategory = {
  slug: string;
  label: string;
  showInNav: boolean;
};

/** Actualiza links `categoria` con DB (showInNav + label) y agrega slugs nuevos. */
export function applyStoreCategoriesToHeaderNav(
  links: readonly HeaderNavLink[],
  categories: readonly StoreNavCategory[],
): HeaderNavLink[] {
  const bySlug = new Map(
    categories.map((category) => [category.slug, category] as const),
  );
  const seen = new Set<string>();

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

    rewritten.push({
      ...link,
      label: category.label,
      href: `/productos?categoria=${category.slug}`,
    });
  }

  const extras = categories
    .filter((category) => category.showInNav && !seen.has(category.slug))
    .map(
      (category): HeaderNavLink => ({
        href: `/productos?categoria=${category.slug}`,
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
