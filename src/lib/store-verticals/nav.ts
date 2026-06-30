export type HeaderNavMatch =
  | { type: "home" }
  | { type: "catalog" }
  | { type: "contact" }
  | { type: "genero"; slug: string }
  | { type: "categoria"; slug: string }
  | { type: "destacados" }
  | { type: "promo2x1" };

export type HeaderNavLink = {
  href: string;
  label: string;
  match: HeaderNavMatch;
  accent?: "promo2x1";
};

export function isStorefrontNavActive(
  match: HeaderNavMatch,
  pathname: string,
  params: {
    genero: string | null;
    categoria: string | null;
    promo?: string | null;
    destacados?: string | null;
  },
) {
  if (match.type === "home") {
    return pathname === "/";
  }

  if (match.type === "contact") {
    return pathname === "/contacto";
  }

  if (pathname !== "/productos") return false;

  if (match.type === "catalog") {
    return (
      !params.genero &&
      !params.categoria &&
      !params.promo &&
      params.destacados !== "1"
    );
  }

  if (match.type === "destacados") {
    return params.destacados === "1" && !params.genero && !params.categoria;
  }

  if (match.type === "promo2x1") {
    return params.promo === "2x1" && !params.genero && !params.categoria;
  }

  if (match.type === "genero") {
    return (
      params.genero === match.slug &&
      !params.categoria &&
      !params.promo &&
      params.destacados !== "1"
    );
  }

  if (match.type === "categoria") {
    return (
      params.categoria === match.slug &&
      !params.genero &&
      !params.promo &&
      params.destacados !== "1"
    );
  }

  return false;
}
