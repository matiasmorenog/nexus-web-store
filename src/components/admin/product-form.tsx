"use client";

import { useState } from "react";
import { createProduct } from "@/lib/admin-actions";
import { STORE_CATEGORIES } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>Nuevo producto</Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-6 space-y-4">
      <h3 className="font-semibold">Nuevo producto</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="category">Categoría</Label>
          <select id="category" name="category" className="flex h-10 w-full rounded-md border border-neutral-300 px-3 text-sm" required>
            {STORE_CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="description">Descripción</Label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="flex w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <Label htmlFor="price">Precio</Label>
          <Input id="price" name="price" type="number" min="0" required />
        </div>
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" name="stock" type="number" min="0" defaultValue="10" required />
        </div>
        <div>
          <Label htmlFor="size">Talle inicial</Label>
          <Input id="size" name="size" defaultValue="M" required />
        </div>
        <div>
          <Label htmlFor="color">Color inicial</Label>
          <Input id="color" name="color" defaultValue="Negro" required />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="imageUrl">URL de imagen</Label>
          <Input id="imageUrl" name="imageUrl" placeholder="https://images.unsplash.com/..." />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="featured" name="featured" />
          <Label htmlFor="featured">Destacado</Label>
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Crear producto"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
