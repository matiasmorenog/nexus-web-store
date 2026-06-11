"use client";

import { useState } from "react";
import { createProduct } from "@/lib/admin-actions";
import { STORE_CATEGORIES } from "@/lib/categories";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Label } from "@/components/ui/label";

const fieldClass =
  "flex w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1";

export function ProductForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await createProduct(formData);
    setLoading(false);
    setOpen(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Productos"
        description="Alta, edición y variantes de tu catálogo."
        action={
          !open ? (
            <Button onClick={() => setOpen(true)}>Nuevo producto</Button>
          ) : undefined
        }
      />

      {open && (
        <AdminCard title="Nuevo producto" description="Completá los datos del producto y su primera variante.">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="category">Categoría</Label>
              <select
                id="category"
                name="category"
                className={fieldClass}
                required
              >
                {STORE_CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className={fieldClass}
                required
              />
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
              <Label htmlFor="size">Talle inicial</Label>
              <Input id="size" name="size" defaultValue="M" required />
            </div>
            <div>
              <Label htmlFor="color">Color inicial</Label>
              <Input id="color" name="color" defaultValue="Negro" required />
            </div>
            <ImageUploadField
              name="imageUrl"
              id="imageUrl"
              label="Imagen del producto"
            />
            <div className="flex items-center gap-2 sm:col-span-2">
              <input type="checkbox" id="featured" name="featured" />
              <Label htmlFor="featured">Destacado</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Crear producto"}
            </Button>
          </div>
        </form>
        </AdminCard>
      )}
    </div>
  );
}
