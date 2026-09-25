"use client";

import { useState } from "react";
import { createProduct } from "@/lib/admin-actions";
import { AdminCard } from "@/components/admin/admin-card";
import { adminBlockedEditShellClass } from "@/components/admin/admin-surface";
import {
  AdminForm,
  AdminFormActions,
  AdminFormGrid,
  AdminTextarea,
} from "@/components/admin/admin-form";
import { ProductTaxonomyFields } from "@/components/admin/product-taxonomy-fields";
import { getAdminVariantLabels } from "@/lib/variant-labels";
import {
  adminProductOptions,
  getAdminProductsCopy,
  readAdminLocaleFromDocument,
} from "@/lib/admin-locale";
import { getClientStorefrontConfig } from "@/lib/store-slug-client";
import { AdminMotion, BlockedEditHint } from "@/components/admin/admin-motion";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProductCategoryDef } from "@/lib/store-verticals/types";
import { SIZELESS_SIZE_VALUE } from "@/lib/product-size";

type ProductCreateFormProps = {
  onClose: () => void;
  blockedHint?: number;
  /** 2x1 disponible: vertical con promo + módulo coupons activo. */
  promo2x1Selectable?: boolean;
  categories?: readonly ProductCategoryDef[];
};

export function ProductCreateForm({
  onClose,
  blockedHint = 0,
  promo2x1Selectable = false,
  categories,
}: ProductCreateFormProps) {
  const [loading, setLoading] = useState(false);
  const locale = readAdminLocaleFromDocument();
  const optionsCopy = adminProductOptions[locale];
  const productsCopy = getAdminProductsCopy(locale);
  const variantLabels = getAdminVariantLabels(locale);
  const sizeToggle = getClientStorefrontConfig().features.productSizeToggle;
  const [hasSize, setHasSize] = useState(!sizeToggle);
  const showPromo2x1 = promo2x1Selectable;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await createProduct(formData);
    setLoading(false);
    onClose();
    (e.target as HTMLFormElement).reset();
  };

  return (
    <AdminMotion variant="panel">
      <AdminCard
        title={productsCopy.newProduct}
        description={productsCopy.createDescription}
        padding={false}
      >
        <div className={adminBlockedEditShellClass}>
          <BlockedEditHint blockedHint={blockedHint}>
            <AdminForm onSubmit={handleSubmit}>
              <AdminFormGrid>
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" name="name" required />
                </div>
                <ProductTaxonomyFields categories={categories} />
                <div className="sm:col-span-2">
                  <Label htmlFor="description">Descripción</Label>
                  <AdminTextarea id="description" name="description" rows={3} required />
                </div>
                <div>
                  <Label htmlFor="price">Precio</Label>
                  <Input id="price" name="price" type="number" min="0" required />
                </div>
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    defaultValue="10"
                    required
                  />
                </div>

                {sizeToggle ? (
                  <div className="sm:col-span-2">
                    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
                      <Switch
                        id="hasSize"
                        name="hasSize"
                        checked={hasSize}
                        onChange={(event) => setHasSize(event.target.checked)}
                      />
                      {optionsCopy.sizeToggle}
                    </label>
                    <p className="mt-1.5 text-xs text-neutral-500">
                      {optionsCopy.sizeToggleHint}
                    </p>
                  </div>
                ) : (
                  <input type="hidden" name="hasSize" value="on" />
                )}

                {hasSize ? (
                  <div>
                    <Label htmlFor="size">
                      {optionsCopy.sizeInitial(variantLabels.secondary)}
                    </Label>
                    <Input
                      id="size"
                      name="size"
                      defaultValue={variantLabels.secondaryInitial ?? "M"}
                      required
                    />
                  </div>
                ) : (
                  <input type="hidden" name="size" value={SIZELESS_SIZE_VALUE} />
                )}

                <div>
                  <Label htmlFor="color">
                    {optionsCopy.primaryInitial(variantLabels.primary)}
                  </Label>
                  <Input
                    id="color"
                    name="color"
                    defaultValue={variantLabels.primaryInitial ?? "Negro"}
                    required
                  />
                </div>
                <ImageUploadField
                  name="imageUrl"
                  id="imageUrl"
                  label={`Imagen del ${variantLabels.primary.toLowerCase()}`}
                />
                <div className="flex items-center gap-2.5 sm:col-span-2">
                  <Switch id="featured" name="featured" />
                  <Label htmlFor="featured" className="cursor-pointer">
                    Destacado
                  </Label>
                </div>
                {showPromo2x1 ? (
                  <div className="flex items-center gap-2.5 sm:col-span-2">
                    <Switch id="promo2x1" name="promo2x1" />
                    <Label htmlFor="promo2x1" className="cursor-pointer">
                      Promoción 2x1
                    </Label>
                  </div>
                ) : null}
              </AdminFormGrid>

              <AdminFormActions>
                <Button type="button" size="sm" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={loading}>
                  {loading ? "Guardando..." : "Crear producto"}
                </Button>
              </AdminFormActions>
            </AdminForm>
          </BlockedEditHint>
        </div>
      </AdminCard>
    </AdminMotion>
  );
}
