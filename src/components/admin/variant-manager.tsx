"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProductThumbnail } from "@/components/admin/product-thumbnail";
import {
  createVariant,
  deleteVariant,
  updateVariant,
} from "@/lib/admin-actions";
import { cn, formatPrice } from "@/lib/utils";
import { AdminMotion } from "@/components/admin/admin-motion";
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
        <AdminMotion variant="inline">
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
        </AdminMotion>
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
      <td className="px-6 py-3">
        <ProductThumbnail
          src={variant.imageUrl}
          alt={`${variant.size} ${variant.color}`}
        />
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
  const [tableOpen, setTableOpen] = useState(false);
  const [activeEdit, setActiveEdit] = useState<ActiveEdit>(null);

  const isBusy = activeEdit !== null;

  const openTable = () => setTableOpen(true);

  const handleAddVariant = () => {
    openTable();
    setActiveEdit({ type: "new" });
  };

  const handleStartEdit = (variantId: string) => {
    openTable();
    setActiveEdit({ type: "edit", id: variantId });
  };

  const toggleTable = () => {
    if (isBusy) return;
    setTableOpen((open) => !open);
  };

  const variantSummary = `${variants.length} variante${variants.length !== 1 ? "s" : ""} registrada${variants.length !== 1 ? "s" : ""}.`;

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-stretch">
        <button
          type="button"
          onClick={toggleTable}
          disabled={isBusy}
          aria-expanded={tableOpen}
          aria-controls="variant-table"
          className={cn(
            "flex min-w-0 flex-1 items-center gap-4 border-b border-neutral-100 bg-neutral-50/50 px-4 py-4 text-left transition-colors sm:border-b-0 sm:px-6",
            !isBusy && "cursor-pointer hover:bg-neutral-100/70",
            isBusy && "cursor-not-allowed opacity-80",
          )}>
          {tableOpen ? (
            <ChevronUp
              className="h-8 w-8 shrink-0 text-neutral-400"
              strokeWidth={2}
              aria-hidden
            />
          ) : (
            <ChevronDown
              className="h-8 w-8 shrink-0 text-neutral-400"
              strokeWidth={2}
              aria-hidden
            />
          )}
          <div className="min-w-0">
            <h2 className="font-semibold text-neutral-900">
              Variantes ({variants.length})
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              {tableOpen
                ? "Talles, colores, stock y precios por variante."
                : variantSummary}
            </p>
          </div>
        </button>
        <div className="flex items-center border-b border-neutral-100 bg-neutral-50/50 px-4 py-3 sm:border-b-0 sm:border-l sm:px-6 sm:py-4">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleAddVariant}
            disabled={isBusy}>
            Agregar variante
          </Button>
        </div>
      </div>
      {tableOpen ? (
        <AdminMotion variant="inline">
          <div
            id="variant-table"
            className={cn("admin-table-scroll", isBusy && "pb-10")}>
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
                      onStartEdit={() => handleStartEdit(variant.id)}
                      onCancelEdit={() => setActiveEdit(null)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </AdminMotion>
      ) : null}
    </div>
  );
}
