"use client";

import { useState } from "react";
import { createProduct } from "@/lib/admin-actions";
import { AdminCard } from "@/components/admin/admin-card";
import {
  AdminCategorySelect,
  AdminForm,
  AdminFormActions,
  AdminFormGrid,
  AdminTextarea,
} from "@/components/admin/admin-form";
import { AdminMotion } from "@/components/admin/admin-motion";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProductCreateFormProps = {
  onClose: () => void;
};

export function ProductCreateForm({ onClose }: ProductCreateFormProps) {
  const [loading, setLoading] = useState(false);

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
      >
        <AdminForm onSubmit={handleSubmit}>
          <AdminFormGrid>
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="category">Categoría</Label>
              <AdminCategorySelect id="category" name="category" required />
            </div>
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
      </AdminCard>
    </AdminMotion>
  );
}
