"use client";

import { useEffect, useState } from "react";
import { AdminCategoryCreateForm } from "@/components/admin/admin-category-create-form";
import { ProductCreateForm } from "@/components/admin/product-create-form";
import type { ProductCategoryDef } from "@/lib/store-verticals/types";
import { useAdminCreateDraftStore } from "@/stores/admin-create-draft-store";

type AdminCreateDraftsHostProps = {
  categories: readonly ProductCategoryDef[];
  promo2x1Selectable: boolean;
};

/**
 * Keeps create-draft modals mounted across admin routes so minimize chips
 * and form state survive module navigation (Rocha-style + sessionStorage).
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
    <>
      <ProductCreateForm
        categories={categories}
        promo2x1Selectable={promo2x1Selectable}
        chipClassName="bottom-4"
      />
      <AdminCategoryCreateForm chipClassName="bottom-20" />
    </>
  );
}
