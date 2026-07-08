"use client";

import { useState } from "react";
import { updateProduct } from "@/lib/admin-actions";
import { AdminCollapsibleCard } from "@/components/admin/admin-collapsible-card";
import {
  AdminForm,
  AdminFormActions,
  AdminFormAlert,
  AdminFormGrid,
  AdminTextarea,
} from "@/components/admin/admin-form";
import { ProductTaxonomyFields } from "@/components/admin/product-taxonomy-fields";
import { getProductTaxonomyLabel } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProductEditFormProps = {
  product: {
    id: string;
    name: string;
    description: string;
    category: string;
    audience: string;
    featured: boolean;
    promo2x1: boolean;
  };
  open: boolean;
  onToggle: () => void;
  disabled?: boolean;
  onBlockedToggle?: () => void;
  /** 2x1 disponible: vertical con promo + módulo coupons activo. */
  promo2x1Selectable?: boolean;
};

export function ProductEditForm({
  product,
  open,
  onToggle,
  disabled = false,
  onBlockedToggle,
  promo2x1Selectable = false,
}: ProductEditFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const collapsedDescription = [
    getProductTaxonomyLabel(product.category, product.audience),
    product.featured ? "Destacado" : null,
    product.promo2x1 ? "2x1" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const formData = new FormData(e.currentTarget);
      await updateProduct(product.id, formData);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminCollapsibleCard
      open={open}
      onToggle={onToggle}
      disabled={disabled}
      onBlockedToggle={onBlockedToggle}
      contentId="product-details"
      title="Datos del producto"
      description={
        open
          ? "Nombre, género, categoría, descripción y visibilidad en el home."
          : `${product.name} · ${collapsedDescription}`
      }
      contentClassName="p-4 sm:p-6"
    >
      <AdminForm onSubmit={handleSubmit}>
        {error ? <AdminFormAlert variant="error">{error}</AdminFormAlert> : null}
        {saved ? (
          <AdminFormAlert variant="success">Cambios guardados</AdminFormAlert>
        ) : null}

        <AdminFormGrid>
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" defaultValue={product.name} required />
          </div>
          <ProductTaxonomyFields
            defaultAudience={product.audience}
            defaultCategory={product.category}
          />
          <div className="sm:col-span-2">
            <Label htmlFor="description">Descripción</Label>
            <AdminTextarea
              id="description"
              name="description"
              rows={4}
              defaultValue={product.description}
              required
            />
          </div>
          <div className="flex items-center gap-2.5 sm:col-span-2">
            <Switch
              id="featured"
              name="featured"
              defaultChecked={product.featured}
            />
            <Label htmlFor="featured" className="cursor-pointer">
              Destacado en home
            </Label>
          </div>
          {promo2x1Selectable ? (
            <div className="flex items-center gap-2.5 sm:col-span-2">
              <Switch
                id="promo2x1"
                name="promo2x1"
                defaultChecked={product.promo2x1}
              />
              <Label htmlFor="promo2x1" className="cursor-pointer">
                Promoción 2x1
              </Label>
            </div>
          ) : product.promo2x1 ? (
            <input type="hidden" name="promo2x1" value="on" />
          ) : null}
        </AdminFormGrid>

        <AdminFormActions>
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Guardando..." : "Guardar producto"}
          </Button>
        </AdminFormActions>
      </AdminForm>
    </AdminCollapsibleCard>
  );
}
