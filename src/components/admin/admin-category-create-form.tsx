"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminCard } from "@/components/admin/admin-card";
import {
  AdminForm,
  AdminFormActions,
  AdminFormAlert,
  AdminFormGrid,
} from "@/components/admin/admin-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { STORE_AUDIENCES } from "@/lib/categories";

export function AdminCategoryCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);

  const toggleAudience = (slug: string) => {
    setSelectedAudiences((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug],
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    if (selectedAudiences.length > 0) {
      formData.set("audiences", JSON.stringify(selectedAudiences));
    }

    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo crear la categoría.");
      }

      event.currentTarget.reset();
      setSelectedAudiences([]);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo crear la categoría.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminCard title="Nueva categoría">
      <AdminForm onSubmit={handleSubmit}>
        {error ? <AdminFormAlert variant="error">{error}</AdminFormAlert> : null}
        <AdminFormGrid>
          <div>
            <Label htmlFor="category-label">Nombre</Label>
            <Input id="category-label" name="label" placeholder="Remeras" required />
          </div>
          <div>
            <Label htmlFor="category-slug">Slug (opcional)</Label>
            <Input
              id="category-slug"
              name="slug"
              placeholder="remeras"
              className="lowercase"
            />
          </div>
          <div>
            <Label htmlFor="category-sort">Orden</Label>
            <Input
              id="category-sort"
              name="sortOrder"
              type="number"
              defaultValue={0}
            />
          </div>
          <div className="flex items-center gap-2.5 sm:col-span-2">
            <Switch id="category-nav" name="showInNav" defaultChecked />
            <Label htmlFor="category-nav">Mostrar en navegación</Label>
          </div>
          <div className="sm:col-span-2">
            <Label>Audiencias (opcional)</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {STORE_AUDIENCES.map((audience) => {
                const active = selectedAudiences.includes(audience.slug);
                return (
                  <button
                    key={audience.slug}
                    type="button"
                    onClick={() => toggleAudience(audience.slug)}
                    className={
                      active
                        ? "rounded-lg bg-neutral-900 px-3 py-1.5 text-sm text-white"
                        : "rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700 hover:border-neutral-400"
                    }
                  >
                    {audience.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-xs text-neutral-500">
              Vacío = visible para todos los públicos.
            </p>
          </div>
        </AdminFormGrid>
        <AdminFormActions>
          <Button type="submit" disabled={loading}>
            {loading ? "Creando…" : "Crear categoría"}
          </Button>
        </AdminFormActions>
      </AdminForm>
    </AdminCard>
  );
}
