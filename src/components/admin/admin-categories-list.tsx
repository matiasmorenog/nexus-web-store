"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { AdminCard } from "@/components/admin/admin-card";
import {
  AdminDataTable,
  AdminTableCell,
  AdminTableRow,
} from "@/components/admin/admin-table";
import { AdminEmptyState } from "@/components/admin/admin-surface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { STORE_AUDIENCES } from "@/lib/categories";
import type { SerializedStoreCategory } from "@/lib/store-categories";

type AdminCategoriesListProps = {
  categories: SerializedStoreCategory[];
};

export function AdminCategoriesList({ categories }: AdminCategoriesListProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (categoryId: string) => {
    if (!window.confirm("¿Eliminar esta categoría?")) return;

    setPendingId(categoryId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo eliminar la categoría.");
      }

      router.refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "No se pudo eliminar la categoría.",
      );
    } finally {
      setPendingId(null);
    }
  };

  const handleSave = async (
    categoryId: string,
    formData: FormData,
  ) => {
    setPendingId(categoryId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "PATCH",
        body: formData,
        credentials: "same-origin",
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo actualizar la categoría.");
      }

      setEditingId(null);
      router.refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "No se pudo actualizar la categoría.",
      );
    } finally {
      setPendingId(null);
    }
  };

  if (categories.length === 0) {
    return (
      <AdminCard title="Categorías">
        <AdminEmptyState>
          <p className="font-medium text-neutral-900">Todavía no hay categorías</p>
          <p className="mt-1 text-sm text-neutral-500">
            Creá la primera o volvé a seedear la tienda para cargar las del vertical.
          </p>
        </AdminEmptyState>
      </AdminCard>
    );
  }

  return (
    <AdminCard title="Categorías de la tienda" padding={false}>
      {error ? (
        <p className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <AdminDataTable
        columns={[
          "Nombre",
          "Slug",
          "Orden",
          "Audiencias",
          "Nav",
          { label: "Acciones", align: "right" },
        ]}
      >
        {categories.map((category) => {
          const isEditing = editingId === category.id;
          const busy = pendingId === category.id;

          if (isEditing) {
            return (
              <AdminTableRow key={category.id}>
                <AdminTableCell colSpan={6}>
                  <CategoryEditRow
                    category={category}
                    busy={busy}
                    onCancel={() => setEditingId(null)}
                    onSave={(formData) => handleSave(category.id, formData)}
                  />
                </AdminTableCell>
              </AdminTableRow>
            );
          }

          return (
            <AdminTableRow key={category.id}>
              <AdminTableCell className="font-medium">{category.label}</AdminTableCell>
              <AdminTableCell>
                <code className="text-xs text-neutral-600">{category.slug}</code>
              </AdminTableCell>
              <AdminTableCell>{category.sortOrder}</AdminTableCell>
              <AdminTableCell>
                {category.audiences?.length ? (
                  <div className="flex flex-wrap gap-1">
                    {category.audiences.map((slug) => (
                      <Badge key={slug}>
                        {STORE_AUDIENCES.find((item) => item.slug === slug)
                          ?.label ?? slug}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-neutral-400">Todas</span>
                )}
              </AdminTableCell>
              <AdminTableCell>
                {category.showInNav ? (
                  <Badge variant="success">Sí</Badge>
                ) : (
                  <Badge>No</Badge>
                )}
              </AdminTableCell>
              <AdminTableCell align="right">
                <div className="flex justify-end gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 px-0"
                    disabled={busy}
                    onClick={() => setEditingId(category.id)}
                    aria-label={`Editar ${category.label}`}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 px-0"
                    disabled={busy}
                    onClick={() => handleDelete(category.id)}
                    aria-label={`Eliminar ${category.label}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </AdminTableCell>
            </AdminTableRow>
          );
        })}
      </AdminDataTable>
    </AdminCard>
  );
}

function CategoryEditRow({
  category,
  busy,
  onCancel,
  onSave,
}: {
  category: SerializedStoreCategory;
  busy: boolean;
  onCancel: () => void;
  onSave: (formData: FormData) => void;
}) {
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>(
    category.audiences ?? [],
  );

  const toggleAudience = (slug: string) => {
    setSelectedAudiences((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug],
    );
  };

  return (
    <form
      className="space-y-3 py-2"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        formData.set("audiences", JSON.stringify(selectedAudiences));
        onSave(formData);
      }}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor={`edit-label-${category.id}`}>Nombre</Label>
          <Input
            id={`edit-label-${category.id}`}
            name="label"
            defaultValue={category.label}
            required
          />
        </div>
        <div>
          <Label htmlFor={`edit-slug-${category.id}`}>Slug</Label>
          <Input
            id={`edit-slug-${category.id}`}
            name="slug"
            defaultValue={category.slug}
            required
            className="lowercase"
          />
        </div>
        <div>
          <Label htmlFor={`edit-sort-${category.id}`}>Orden</Label>
          <Input
            id={`edit-sort-${category.id}`}
            name="sortOrder"
            type="number"
            defaultValue={category.sortOrder}
          />
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <Switch
          id={`edit-nav-${category.id}`}
          name="showInNav"
          defaultChecked={category.showInNav}
        />
        <Label htmlFor={`edit-nav-${category.id}`}>Mostrar en navegación</Label>
      </div>
      <div>
        <Label>Audiencias</Label>
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
                    : "rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700"
                }
              >
                {audience.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? "Guardando…" : "Guardar"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
