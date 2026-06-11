"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  createVariant,
  deleteVariant,
  updateVariant,
} from "@/lib/admin-actions";
import { cn, formatPrice } from "@/lib/utils";
import { AdminCard } from "@/components/admin/admin-card";
import { ImageUploadField } from "@/components/admin/image-upload-field";
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
    <div className="space-y-4">
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
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
      </div>
      <ImageUploadField
        key={`${formId}-${values?.imageUrl ?? "new"}`}
        id={`${formId}-imageUrl`}
        name="imageUrl"
        label="Imagen"
        defaultValue={values?.imageUrl ?? ""}
        compact
      />
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
  const rowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    rowRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  return (
    <tr ref={rowRef} className="scroll-mb-24">
      <td colSpan={6} className="bg-neutral-50/80 px-6 py-4 pb-8">
        <form onSubmit={onSubmit} className="space-y-3">
          <p className="text-sm font-medium text-neutral-700">{title}</p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <VariantFormFields formId={formId} values={values} />
          <div
            className={cn(
              "ml-auto flex w-fit justify-end gap-2",
              "sticky right-0 z-10 -mr-6 py-2 pl-3 pr-6",
              "md:static md:mr-0 md:bg-transparent md:py-0 md:pl-0 md:pr-0",
            )}>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "..." : submitLabel}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onCancel}
              disabled={loading}>
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
    <tr className="hover:bg-neutral-50/50">
      <td className="px-6 py-4">
        <div className="relative h-10 w-8 overflow-hidden rounded bg-neutral-100">
          <Image
            src={variant.imageUrl}
            alt={`${variant.size} ${variant.color}`}
            fill
            className="object-cover"
            sizes="32px"
          />
        </div>
      </td>
      <td className="px-6 py-4 font-medium text-neutral-900">
        {variant.size} / {variant.color}
      </td>
      <td className="px-6 py-4 font-mono text-xs text-neutral-500">
        {variant.sku}
      </td>
      <td className="px-6 py-4 font-medium">{formatPrice(variant.price)}</td>
      <td className="px-6 py-4">
        <span
          className={
            variant.stock === 0
              ? "font-medium text-red-600"
              : variant.stock <= 3
                ? "font-medium text-amber-600"
                : ""
          }>
          {variant.stock}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onStartEdit}
            disabled={loading || editDisabled}>
            Editar
          </Button>
          {variant.orderItemCount === 0 && (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading || editDisabled}>
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
    <AdminCard
      title={`Variantes (${variants.length})`}
      description="Talles, colores, stock y precios por variante."
      padding={false}
      action={
        <Button
          size="sm"
          onClick={() => setActiveEdit({ type: "new" })}
          disabled={isBusy}>
          Agregar variante
        </Button>
      }>
      <div className={cn("overflow-x-auto", isBusy && "pb-10")}>
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="border-b border-neutral-100 bg-neutral-50/80">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-neutral-600">
                Imagen
              </th>
              <th className="px-6 py-3 text-left font-medium text-neutral-600">
                Talle / Color
              </th>
              <th className="px-6 py-3 text-left font-medium text-neutral-600">
                SKU
              </th>
              <th className="px-6 py-3 text-left font-medium text-neutral-600">
                Precio
              </th>
              <th className="px-6 py-3 text-left font-medium text-neutral-600">
                Stock
              </th>
              <th className="px-6 py-3 text-left font-medium text-neutral-600">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
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
    </AdminCard>
  );
}
