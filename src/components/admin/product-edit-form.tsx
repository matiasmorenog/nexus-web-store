"use client";

import { useState } from "react";
import { updateProduct } from "@/lib/admin-actions";
import { AdminCollapsibleCard } from "@/components/admin/admin-collapsible-card";
import {
  AdminCategorySelect,
  AdminForm,
  AdminFormActions,
  AdminFormAlert,
  AdminFormGrid,
  AdminTextarea,
} from "@/components/admin/admin-form";
import { getCategoryLabel } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProductEditFormProps = {
  product: {
    id: string;
    name: string;
    description: string;
    category: string;
    featured: boolean;
  };
  open: boolean;
  onToggle: () => void;
  disabled?: boolean;
  onBlockedToggle?: () => void;
};

export function ProductEditForm({
  product,
  open,
  onToggle,
  disabled = false,
  onBlockedToggle,
}: ProductEditFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const collapsedDescription = [
    getCategoryLabel(product.category),
    product.featured ? "Destacado" : null,
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
          ? "Nombre, categoría, descripción y visibilidad en el home."
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
          <div>
            <Label htmlFor="category">Categoría</Label>
            <AdminCategorySelect
              id="category"
              name="category"
              defaultValue={product.category}
              required
            />
          </div>
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
          <div className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              defaultChecked={product.featured}
            />
            <Label htmlFor="featured">Destacado en home</Label>
          </div>
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
