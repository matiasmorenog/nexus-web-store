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
import { getClientStorefrontConfig } from "@/lib/store-slug-client";
import { getClientVariantLabels } from "@/lib/variant-labels";
import { AdminMotion, BlockedEditHint } from "@/components/admin/admin-motion";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProductCreateFormProps = {
  onClose: () => void;
  blockedHint?: number;
};

export function ProductCreateForm({
  onClose,
  blockedHint = 0,
}: ProductCreateFormProps) {
  const [loading, setLoading] = useState(false);
  const storefrontConfig = getClientStorefrontConfig();
  const variantLabels = getClientVariantLabels();
  const showPromo2x1 = storefrontConfig.features.promo2x1;

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
        title="Nuevo producto"
        description="Completá los datos del producto y su primera variante."
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
                <ProductTaxonomyFields />
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
                <div>
                  <Label htmlFor="size">{variantLabels.secondary} inicial</Label>
                  <Input
                    id="size"
                    name="size"
                    defaultValue={variantLabels.secondaryInitial ?? "M"}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="color">{variantLabels.primary} inicial</Label>
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
                  <Checkbox id="featured" name="featured" />
                  <Label htmlFor="featured" className="cursor-pointer">
                    Destacado
                  </Label>
                </div>
                {showPromo2x1 ? (
                  <div className="flex items-center gap-2.5 sm:col-span-2">
                    <Checkbox id="promo2x1" name="promo2x1" />
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
