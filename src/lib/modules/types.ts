export type ModuleCategory =
  | "marketing"
  | "operations"
  | "integrations"
  | "storefront";

export type ModuleDefinition = {
  id: string;
  name: string;
  description: string;
  monthlyPriceUsd: number;
  category: ModuleCategory;
  /** Rutas admin que requieren este módulo (cuando existan). */
  adminRoutes: readonly string[];
  /** Superficies del storefront afectadas (cupones, wishlist, pixel, etc.). */
  storefrontSurfaces?: readonly string[];
};

export type ModuleAccessResult =
  | { allowed: true }
  | { allowed: false; moduleId: string; upgradeHref: string };

export const MODULE_REQUIRED_ERROR_CODE = "MODULE_REQUIRED" as const;
