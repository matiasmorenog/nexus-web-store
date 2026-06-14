"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProductThumbnail } from "@/components/admin/product-thumbnail";
import { AdminCollapsibleCard } from "@/components/admin/admin-collapsible-card";
import {
  AdminForm,
  AdminFormActions,
  AdminFormGrid,
} from "@/components/admin/admin-form";
import {
  AdminDataTable,
  AdminTableActions,
  AdminTableCell,
  AdminTableIconAction,
  AdminTableRow,
} from "@/components/admin/admin-table";
import {
  createVariant,
  deleteVariant,
  updateVariant,
} from "@/lib/admin-actions";
import { cn, formatPrice } from "@/lib/utils";
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
    <AdminFormGrid columns={4} className="gap-3">
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
      <div className="col-span-2 sm:col-span-4">
        <ImageUploadField
          key={`${formId}-${values?.imageUrl ?? "new"}`}
          id={`${formId}-imageUrl`}
          name="imageUrl"
          label="Imagen"
          defaultValue={values?.imageUrl ?? ""}
          compact
        />
      </div>
    </AdminFormGrid>
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
    <AdminTableRow ref={rowRef} className="scroll-mb-24 hover:bg-transparent">
      <AdminTableCell colSpan={6} className="bg-neutral-50/80 px-6 py-4 pb-8">
        <AdminForm onSubmit={onSubmit} className="space-y-3">
          <p className="text-sm font-medium text-neutral-700">{title}</p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <VariantFormFields formId={formId} values={values} />
          <AdminFormActions sticky>
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
          </AdminFormActions>
        </AdminForm>
      </AdminTableCell>
    </AdminTableRow>
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
    <AdminTableRow>
      <AdminTableCell>
        <ProductThumbnail
          src={variant.imageUrl}
          alt={`${variant.size} ${variant.color}`}
        />
      </AdminTableCell>
      <AdminTableCell className="font-medium text-neutral-900">
        {variant.size} / {variant.color}
      </AdminTableCell>
      <AdminTableCell className="font-mono text-xs text-neutral-500">
        {variant.sku}
      </AdminTableCell>
      <AdminTableCell className="font-medium">
        {formatPrice(variant.price)}
      </AdminTableCell>
      <AdminTableCell>
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
      </AdminTableCell>
      <AdminTableCell>
        <AdminTableActions>
          <AdminTableIconAction
            label={`Editar variante ${variant.size} / ${variant.color}`}
            icon={Pencil}
            onClick={onStartEdit}
            disabled={loading || editDisabled}
            loading={loading}
          />
          {variant.orderItemCount === 0 ? (
            <AdminTableIconAction
              label={`Eliminar variante ${variant.size} / ${variant.color}`}
              icon={Trash2}
              onClick={handleDelete}
              disabled={loading || editDisabled}
              loading={loading}
            />
          ) : null}
        </AdminTableActions>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </AdminTableCell>
    </AdminTableRow>
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
    <AdminCollapsibleCard
      open={tableOpen}
      onToggle={toggleTable}
      disabled={isBusy}
      contentId="variant-table"
      title={`Variantes (${variants.length})`}
      description={
        tableOpen
          ? "Talles, colores, stock y precios por variante."
          : variantSummary
      }
      action={
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="w-full sm:w-auto"
          onClick={handleAddVariant}
          disabled={isBusy}>
          Agregar variante
        </Button>
      }>
      <AdminDataTable
        id="variant-table"
        scrollClassName={cn(isBusy && "pb-10")}
        tableClassName="min-w-[40rem]"
        columns={[
          "Imagen",
          "Talle / Color",
          "SKU",
          "Precio",
          "Stock",
          "Acciones",
        ]}>
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
      </AdminDataTable>
    </AdminCollapsibleCard>
  );
}
