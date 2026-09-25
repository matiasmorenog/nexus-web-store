import { getPublicStoreSlug } from "@/lib/store-env";
import {
  APP1_STORE_SLUG,
  APP2_STORE_SLUG,
  APP3_STORE_SLUG,
} from "@/lib/store-slugs";

/**
 * Emails alineados con `prisma/seed-env.ts`. Sin contraseñas.
 * Manoviva (app3) is a real store: no demo staff persona for the owner
 * (passwordless demo login must not impersonate production owner).
 */
const STORE_OWNER_EMAIL: Record<string, string> = {
  [APP1_STORE_SLUG]: "matiasmorenog+goat-admin@gmail.com",
  [APP2_STORE_SLUG]: "matiasmorenog+vape-nexus@gmail.com",
};

const GOAT_CUSTOMER_EMAIL = "matiasmorenog+goat-customer@gmail.com";

export type DemoPersonaKind = "customer" | "staff";

export type DemoPersonaSpec = {
  id: string;
  kind: DemoPersonaKind;
  email: string;
  label: string;
  description: string;
};

export function demoPersonasForStore(
  slug: string = getPublicStoreSlug(),
  kind: DemoPersonaKind | "all" = "all",
): DemoPersonaSpec[] {
  const personas: DemoPersonaSpec[] = [];

  // Real Manoviva owner is never a passwordless demo persona.
  if (slug !== APP3_STORE_SLUG) {
    const owner = STORE_OWNER_EMAIL[slug];
    if (owner) {
      personas.push({
        id: "staff-owner",
        kind: "staff",
        email: owner,
        label: "Admin de la tienda",
        description: "Dueño del seed de esta tienda. Entra al panel.",
      });
    }
  }

  if (slug === APP1_STORE_SLUG) {
    personas.push({
      id: "customer-demo",
      kind: "customer",
      email: GOAT_CUSTOMER_EMAIL,
      label: "Cliente demo",
      description: "Cuenta cliente del seed de Goat. Ve sus pedidos.",
    });
  }

  if (kind === "all") return personas;
  return personas.filter((persona) => persona.kind === kind);
}

export function getDemoPersonaById(
  id: string,
  slug: string = getPublicStoreSlug(),
): DemoPersonaSpec | undefined {
  return demoPersonasForStore(slug, "all").find((persona) => persona.id === id);
}
