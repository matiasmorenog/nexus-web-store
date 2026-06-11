"use client";

import { useState } from "react";
import Image from "next/image";
import {
  createVariant,
  deleteVariant,
  updateVariant,
} from "@/lib/admin-actions";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type VariantRow = {
  id: string;
  size: string;
  color: string;
  sku: string;
  stock: number;
  price: number;
  imageUrl: string;
  orderItemCount: number;
};

type VariantManagerProps = {
  productId: string;
  variants: VariantRow[];
};

type ActiveEdit = { type: "new" } | { type: "edit"; id: string } | null;

type VariantFormValues = {
  size: string;
  color: string;
  price: number | string;
  stock: number | string;
  imageUrl: string;
};

function VariantFormFields({
  formId,
  values,
}: {
  formId: string;
  values?: Partial<VariantFormValues>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <div>
        <Label htmlFor={`${formId}-size`}>Talle</Label>
        <Input
          id={`${formId}-size`}
          name="size"
          defaultValue={values?.size ?? "M"}
          required
        />
      </div>
      <div>
        <Label htmlFor={`${formId}-color`}>Color</Label>
        <Input
          id={`${formId}-color`}
          name="color"
          defaultValue={values?.color ?? ""}
          required
        />
      </div>
      <div>
        <Label htmlFor={`${formId}-price`}>Precio</Label>
        <Input
          id={`${formId}-price`}
          name="price"
          type="number"
          min="0"
          step="0.01"
          defaultValue={values?.price ?? ""}
          required
        />
      </div>
      <div>
        <Label htmlFor={`${formId}-stock`}>Stock</Label>
        <Input
          id={`${formId}-stock`}
          name="stock"
          type="number"
          min="0"
          defaultValue={values?.stock ?? 10}
          required
        />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor={`${formId}-imageUrl`}>URL imagen</Label>
        <Input
          id={`${formId}-imageUrl`}
          name="imageUrl"
          defaultValue={values?.imageUrl ?? ""}
          placeholder="https://images.unsplash.com/..."
        />
      </div>
    </div>
  );
}

function VariantInlineForm({
  formId,
  title,
  values,
  submitLabel,
  loading,
  error,
  onSubmit,
  onCancel,
}: {
  formId: string;
  title: string;
  values?: Partial<VariantFormValues>;
  submitLabel: string;
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  return (
    <tr>
      <td colSpan={6} className="bg-neutral-50 px-4 py-4">
        <form onSubmit={onSubmit} className="space-y-3">
          <p className="text-sm font-medium text-neutral-700">{title}</p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <VariantFormFields formId={formId} values={values} />
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "..." : submitLabel}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </td>
    </tr>
  );
}

function NewVariantRow({
  productId,
  onCancel,
  onSuccess,
}: {
  productId: string;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createVariant(productId, new FormData(e.currentTarget));
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear variante");
    } finally {
      setLoading(false);
    }
  };

  return (
    <VariantInlineForm
      formId="new-variant"
      title="Nueva variante"
      submitLabel="Crear variante"
      loading={loading}
      error={error}
      onSubmit={handleCreate}
      onCancel={onCancel}
    />
  );
}

function VariantEditRow({
  variant,
  isEditing,
  editDisabled,
  onStartEdit,
  onCancelEdit,
}: {
  variant: VariantRow;
  isEditing: boolean;
  editDisabled: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await updateVariant(variant.id, new FormData(e.currentTarget));
      onCancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Eliminar esta variante?")) return;
    setLoading(true);
    setError(null);
    try {
      await deleteVariant(variant.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <VariantInlineForm
        formId={`variant-${variant.id}`}
        title={`Editar: ${variant.size} / ${variant.color}`}
        values={variant}
        submitLabel="Guardar"
        loading={loading}
        error={error}
        onSubmit={handleUpdate}
        onCancel={onCancelEdit}
      />
    );
  }

  return (
    <tr className="divide-y">
      <td className="px-4 py-3">
        <div className="relative h-10 w-8 overflow-hidden rounded bg-neutral-100">
          <Image
            src={variant.imageUrl}
            alt={`${variant.size} ${variant.color}`}
            fill
            className="object-cover"
          />
        </div>
      </td>
      <td className="px-4 py-3">
        {variant.size} / {variant.color}
      </td>
      <td className="px-4 py-3 font-mono text-xs text-neutral-500">
        {variant.sku}
      </td>
      <td className="px-4 py-3">{formatPrice(variant.price)}</td>
      <td className="px-4 py-3">
        <span
          className={
            variant.stock === 0
              ? "font-medium text-red-600"
              : variant.stock <= 3
                ? "font-medium text-amber-600"
                : ""
          }
        >
          {variant.stock}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={onStartEdit}
            disabled={loading || editDisabled}
          >
            Editar
          </Button>
          {variant.orderItemCount === 0 && (
            <Button
              size="sm"
              variant="danger"
              onClick={handleDelete}
              disabled={loading || editDisabled}
            >
              Eliminar
            </Button>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </td>
    </tr>
  );
}

export function VariantManager({ productId, variants }: VariantManagerProps) {
  const [activeEdit, setActiveEdit] = useState<ActiveEdit>(null);

  const isBusy = activeEdit !== null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Variantes ({variants.length})</h2>
        <Button
          size="sm"
          onClick={() => setActiveEdit({ type: "new" })}
          disabled={isBusy}
        >
          Agregar variante
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Imagen</th>
              <th className="px-4 py-3 text-left font-medium">Talle / Color</th>
              <th className="px-4 py-3 text-left font-medium">SKU</th>
              <th className="px-4 py-3 text-left font-medium">Precio</th>
              <th className="px-4 py-3 text-left font-medium">Stock</th>
              <th className="px-4 py-3 text-left font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {activeEdit?.type === "new" && (
              <NewVariantRow
                productId={productId}
                onCancel={() => setActiveEdit(null)}
                onSuccess={() => setActiveEdit(null)}
              />
            )}
            {variants.map((variant) => {
              const isEditing =
                activeEdit?.type === "edit" && activeEdit.id === variant.id;

              return (
                <VariantEditRow
                  key={variant.id}
                  variant={variant}
                  isEditing={isEditing}
                  editDisabled={isBusy && !isEditing}
                  onStartEdit={() =>
                    setActiveEdit({ type: "edit", id: variant.id })
                  }
                  onCancelEdit={() => setActiveEdit(null)}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
