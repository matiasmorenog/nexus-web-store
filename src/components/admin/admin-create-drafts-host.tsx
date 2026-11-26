"use client";

import { useEffect, useState } from "react";
import { ProductCreateForm } from "@/components/admin/product-create-form";
import type { ProductCategoryDef } from "@/lib/store-verticals/types";
import { useAdminCreateDraftStore } from "@/stores/admin-create-draft-store";

type AdminCreateDraftsHostProps = {
  categories: readonly ProductCategoryDef[];
  promo2x1Selectable: boolean;
};

/**
 * Keeps product create-draft modal mounted across admin routes (minimize chip
 * + sessionStorage). Category / invite use commit modals (no draft) on-page.
 */
export function AdminCreateDraftsHost({
  categories,
  promo2x1Selectable,
}: AdminCreateDraftsHostProps) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const finish = () => setHydrated(true);
    if (useAdminCreateDraftStore.persist.hasHydrated()) {
      finish();
      return;
    }
    return useAdminCreateDraftStore.persist.onFinishHydration(finish);
  }, []);

  if (!hydrated) return null;

  return (
    <ProductCreateForm
      categories={categories}
      promo2x1Selectable={promo2x1Selectable}
      chipClassName="bottom-4"
    />
  );
}
