"use client";

import { useState } from "react";
import { updateProduct } from "@/lib/admin-actions";
import { STORE_CATEGORIES } from "@/lib/categories";
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
};

export function ProductEditForm({ product }: ProductEditFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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
    <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-6 space-y-4">
      <h2 className="font-semibold">Datos del producto</h2>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      {saved && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Cambios guardados
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" defaultValue={product.name} required />
        </div>
        <div>
          <Label htmlFor="category">Categoría</Label>
          <select
            id="category"
            name="category"
            defaultValue={product.category}
            className="flex h-10 w-full rounded-md border border-neutral-300 px-3 text-sm"
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
            rows={4}
            defaultValue={product.description}
            className="flex w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
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
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Guardando..." : "Guardar producto"}
      </Button>
    </form>
  );
}
