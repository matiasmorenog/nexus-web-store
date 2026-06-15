"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ProductThumbnail } from "@/components/admin/product-thumbnail";
import { AdminCollapsibleCard } from "@/components/admin/admin-collapsible-card";
import { adminBlockedEditShellClass } from "@/components/admin/admin-surface";
import { BlockedEditHint, RowEditEnter } from "@/components/admin/admin-motion";
import { AdminDataTableSkeleton } from "@/components/admin/admin-skeleton";
import {
  AdminForm,
  AdminFormActions,
  AdminFormGrid,
  adminSelectClass,
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
  upsertProductColor,
} from "@/lib/admin-actions";
import {
  buildColorImageMap,
  getUniqueProductColors,
  normalizeVariantColor,
} from "@/lib/variant-images";
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
  variantsLoading?: boolean;
  variantsFetched?: boolean;
  variantsError?: string | null;
  onVariantsReload?: () => Promise<void>;
  open: boolean;
  onToggle: () => void;
  onOpen: () => void;
  accordionLocked?: boolean;
  onBusyChange?: (busy: boolean) => void;
  onBlockedToggle?: () => void;
  blockedHint?: number;
};

type ActiveEdit = { type: "new" } | { type: "edit"; id: string } | null;

type VariantFormValues = {
  size: string;
  color: string;
  price: number | string;
  stock: number | string;
};

type ColorEdit = { type: "new" } | { type: "edit"; color: string } | null;

function ColorFormPanel({
  formId,
  title,
  values,
  originalColor,
  loading,
  error,
  disabled,
  onSubmit,
  onCancel,
  blockedHint = 0,
}: {
  formId: string;
  title: string;
  values?: { color: string; imageUrl: string };
  originalColor?: string;
  loading: boolean;
  error: string | null;
  disabled?: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  blockedHint?: number;
}) {
  return (
    <BlockedEditHint blockedHint={blockedHint}>
      <RowEditEnter>
        <AdminForm onSubmit={onSubmit} className="space-y-4">
        <p className="text-sm font-medium text-neutral-800">{title}</p>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
          <div className="space-y-2">
            <Label htmlFor={`${formId}-color`}>Nombre del color</Label>
            <Input
              id={`${formId}-color`}
              name="color"
              defaultValue={values?.color ?? ""}
              placeholder="Ej. Negro, Verde oliva..."
              required
              disabled={disabled || loading}
            />
            {originalColor ? (
              <input type="hidden" name="originalColor" value={originalColor} />
            ) : null}
          </div>

          <ImageUploadField
            key={`${formId}-${values?.imageUrl ?? "new"}`}
            id={`${formId}-image`}
            name="imageUrl"
            label="Imagen del color"
            defaultValue={values?.imageUrl ?? ""}
          />
        </div>

        <AdminFormActions sticky>
          <Button type="submit" size="sm" disabled={disabled || loading}>
            {loading ? "Guardando..." : "Guardar"}
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
        </AdminFormActions>
      </AdminForm>
      </RowEditEnter>
    </BlockedEditHint>
  );
}

function NewColorRow({
  productId,
  onCancel,
  onSuccess,
  onVariantsReload,
  disabled,
  blockedHint = 0,
}: {
  productId: string;
  onCancel: () => void;
  onSuccess: () => void;
  onVariantsReload?: () => Promise<void>;
  disabled?: boolean;
  blockedHint?: number;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await upsertProductColor(productId, new FormData(e.currentTarget));
      await onVariantsReload?.();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el color");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminTableRow className="scroll-mb-24 hover:bg-transparent">
      <AdminTableCell colSpan={3} className={adminBlockedEditShellClass}>
        <ColorFormPanel
          formId="new-color"
          title="Nuevo color"
          loading={loading}
          error={error}
          disabled={disabled}
          onSubmit={handleSubmit}
          onCancel={onCancel}
          blockedHint={blockedHint}
        />
        <p className="mt-3 text-xs text-neutral-400">
          Se crea el talle M con stock 0 para que puedas sumar más talles en variantes.
        </p>
      </AdminTableCell>
    </AdminTableRow>
  );
}

function ColorEditRow({
  productId,
  color,
  imageUrl,
  isEditing,
  editDisabled,
  onStartEdit,
  onCancelEdit,
  onVariantsReload,
  onBlockedToggle,
  blockedHint = 0,
}: {
  productId: string;
  color: string;
  imageUrl: string;
  isEditing: boolean;
  editDisabled: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onVariantsReload?: () => Promise<void>;
  onBlockedToggle?: () => void;
  blockedHint?: number;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await upsertProductColor(productId, new FormData(e.currentTarget));
      await onVariantsReload?.();
      onCancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el color");
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <AdminTableRow className="scroll-mb-24 hover:bg-transparent">
        <AdminTableCell colSpan={3} className={adminBlockedEditShellClass}>
          <ColorFormPanel
            formId={`edit-color-${color}`}
            title={`Editar: ${color}`}
            values={{ color, imageUrl }}
            originalColor={color}
            loading={loading}
            error={error}
            onSubmit={handleSubmit}
            onCancel={onCancelEdit}
            blockedHint={blockedHint}
          />
        </AdminTableCell>
      </AdminTableRow>
    );
  }

  return (
    <AdminTableRow>
      <AdminTableCell>
        <ProductThumbnail src={imageUrl} alt={color} />
      </AdminTableCell>
      <AdminTableCell className="font-medium text-neutral-900">{color}</AdminTableCell>
      <AdminTableCell>
        <AdminTableActions>
          <AdminTableIconAction
            label={`Editar color ${color}`}
            icon={Pencil}
            onClick={() => {
              if (editDisabled) {
                onBlockedToggle?.();
                return;
              }
              onStartEdit();
            }}
            blocked={editDisabled}
            disabled={loading}
            loading={loading}
          />
        </AdminTableActions>
      </AdminTableCell>
    </AdminTableRow>
  );
}

export function ProductColorsCard({
  productId,
  variants,
  variantsLoading = false,
  variantsFetched = false,
  variantsError = null,
  onVariantsReload,
  open,
  onToggle,
  onOpen,
  disabled,
  onBusyChange,
  onBlockedToggle,
  blockedHint = 0,
}: {
  productId: string;
  variants: VariantRow[];
  variantsLoading?: boolean;
  variantsFetched?: boolean;
  variantsError?: string | null;
  onVariantsReload?: () => Promise<void>;
  open: boolean;
  onToggle: () => void;
  onOpen?: () => void;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
  onBlockedToggle?: () => void;
  blockedHint?: number;
}) {
  const [activeEdit, setActiveEdit] = useState<ColorEdit>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const productColors = useMemo(() => getUniqueProductColors(variants), [variants]);
  const colorImageMap = useMemo(() => buildColorImageMap(variants), [variants]);
  const isBusy = activeEdit !== null;
  const colorSummary = !variantsFetched
    ? "Fotos por color del producto"
    : productColors.length === 0
      ? "Sin colores cargados"
      : `${productColors.length} color${productColors.length !== 1 ? "es" : ""}`;

  const handleAddColor = () => {
    setSuccess(null);
    onOpen?.();
    setActiveEdit({ type: "new" });
  };

  const showLoading = variantsLoading && !variantsFetched;

  useEffect(() => {
    onBusyChange?.(isBusy);
  }, [isBusy, onBusyChange]);

  return (
    <AdminCollapsibleCard
      open={open}
      onToggle={onToggle}
      disabled={disabled}
      onBlockedToggle={onBlockedToggle}
      contentId="product-colors"
      title="Colores"
      description={
        open
          ? "Una foto por color; los talles se agregan en variantes."
          : colorSummary
      }
      action={
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="w-full sm:w-auto"
          onClick={handleAddColor}
          disabled={disabled || isBusy || showLoading}
        >
          Agregar color
        </Button>
      }
    >
      {showLoading ? (
        <AdminDataTableSkeleton
          columns={["Imagen", "Color", "Acciones"]}
          rows={3}
          tableClassName="min-w-[24rem]"
          ariaLabel="Cargando colores"
        />
      ) : variantsError ? (
        <p className="p-4 text-sm text-red-600 sm:p-6">{variantsError}</p>
      ) : (
        <>
          {success ? (
            <p className="border-b border-neutral-100 px-4 py-3 text-sm text-green-700 sm:px-6">
              {success}
            </p>
          ) : null}

          <AdminDataTable
            id="product-colors-table"
            scrollClassName={cn(isBusy && "pb-6")}
            tableClassName="min-w-[24rem]"
            columns={["Imagen", "Color", "Acciones"]}
          >
            {activeEdit?.type === "new" ? (
              <NewColorRow
                productId={productId}
                disabled={disabled}
                onCancel={() => setActiveEdit(null)}
                onSuccess={() => {
                  setActiveEdit(null);
                  setSuccess("Color agregado");
                }}
                onVariantsReload={onVariantsReload}
                blockedHint={blockedHint}
              />
            ) : null}

            {productColors.length === 0 && activeEdit?.type !== "new" ? (
              <AdminTableRow className="hover:bg-transparent">
                <AdminTableCell
                  colSpan={3}
                  className="px-4 py-8 text-center text-sm text-neutral-500 sm:px-6"
                >
                  Todavía no hay colores. Usá &quot;Agregar color&quot; para cargar el
                  primero.
                </AdminTableCell>
              </AdminTableRow>
            ) : (
              productColors.map((color) => {
                const isEditing =
                  activeEdit?.type === "edit" && activeEdit.color === color;

                return (
                  <ColorEditRow
                    key={color}
                    productId={productId}
                    color={color}
                    imageUrl={
                      colorImageMap.get(normalizeVariantColor(color)) ?? ""
                    }
                    isEditing={isEditing}
                    editDisabled={isBusy && !isEditing}
                    onStartEdit={() => {
                      setSuccess(null);
                      setActiveEdit({ type: "edit", color });
                    }}
                    onCancelEdit={() => setActiveEdit(null)}
                    onVariantsReload={onVariantsReload}
                    blockedHint={blockedHint}
                    onBlockedToggle={onBlockedToggle}
                  />
                );
              })
            )}
          </AdminDataTable>
        </>
      )}
    </AdminCollapsibleCard>
  );
}

function VariantFormFields({
  formId,
  values,
  colors,
}: {
  formId: string;
  values?: Partial<VariantFormValues>;
  colors: string[];
}) {
  return (
    <AdminFormGrid columns={4} className="gap-3">
      <div>
        <Label htmlFor={`${formId}-color`}>Color</Label>
        <select
          id={`${formId}-color`}
          name="color"
          className={adminSelectClass}
          defaultValue={values?.color ?? ""}
          required
        >
          <option value="" disabled>
            Seleccionar color
          </option>
          {colors.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>
      </div>
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
    </AdminFormGrid>
  );
}

function VariantInlineForm({
  formId,
  title,
  values,
  colors,
  submitLabel,
  loading,
  error,
  onSubmit,
  onCancel,
  blockedHint = 0,
}: {
  formId: string;
  title: string;
  values?: Partial<VariantFormValues>;
  colors: string[];
  submitLabel: string;
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  blockedHint?: number;
}) {
  const rowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    rowRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  return (
    <AdminTableRow ref={rowRef} className="scroll-mb-24 hover:bg-transparent">
      <AdminTableCell colSpan={6} className={adminBlockedEditShellClass}>
        <BlockedEditHint blockedHint={blockedHint}>
          <RowEditEnter>
            <AdminForm onSubmit={onSubmit} className="space-y-3">
            <p className="text-sm font-medium text-neutral-700">{title}</p>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <VariantFormFields
              key={formId}
              formId={formId}
              values={values}
              colors={colors}
            />
            <AdminFormActions sticky>
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
            </AdminFormActions>
          </AdminForm>
          </RowEditEnter>
        </BlockedEditHint>
      </AdminTableCell>
    </AdminTableRow>
  );
}

function NewVariantRow({
  productId,
  colors,
  onCancel,
  onSuccess,
  onVariantsReload,
  blockedHint = 0,
}: {
  productId: string;
  colors: string[];
  onCancel: () => void;
  onSuccess: () => void;
  onVariantsReload?: () => Promise<void>;
  blockedHint?: number;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createVariant(productId, new FormData(e.currentTarget));
      await onVariantsReload?.();
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
      colors={colors}
      submitLabel="Crear variante"
      loading={loading}
      error={error}
      onSubmit={handleCreate}
      onCancel={onCancel}
      blockedHint={blockedHint}
    />
  );
}

function VariantEditRow({
  variant,
  colors,
  isEditing,
  editDisabled,
  onStartEdit,
  onCancelEdit,
  onVariantsReload,
  onBlockedToggle,
  blockedHint = 0,
}: {
  variant: VariantRow;
  colors: string[];
  isEditing: boolean;
  editDisabled: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onVariantsReload?: () => Promise<void>;
  onBlockedToggle?: () => void;
  blockedHint?: number;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await updateVariant(variant.id, new FormData(e.currentTarget));
      await onVariantsReload?.();
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
      await onVariantsReload?.();
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
        colors={colors}
        submitLabel="Guardar"
        loading={loading}
        error={error}
        onSubmit={handleUpdate}
        onCancel={onCancelEdit}
        blockedHint={blockedHint}
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
          }
        >
          {variant.stock}
        </span>
      </AdminTableCell>
      <AdminTableCell>
        <AdminTableActions>
          <AdminTableIconAction
            label={`Editar variante ${variant.size} / ${variant.color}`}
            icon={Pencil}
            onClick={() => {
              if (editDisabled) {
                onBlockedToggle?.();
                return;
              }
              onStartEdit();
            }}
            blocked={editDisabled}
            disabled={loading}
            loading={loading}
          />
          {variant.orderItemCount === 0 ? (
            <AdminTableIconAction
              label={`Eliminar variante ${variant.size} / ${variant.color}`}
              icon={Trash2}
              onClick={() => {
                if (editDisabled) {
                  onBlockedToggle?.();
                  return;
                }
                void handleDelete();
              }}
              blocked={editDisabled}
              disabled={loading}
              loading={loading}
            />
          ) : null}
        </AdminTableActions>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </AdminTableCell>
    </AdminTableRow>
  );
}

export function VariantManager({
  productId,
  variants,
  variantsLoading = false,
  variantsFetched = false,
  variantsError = null,
  onVariantsReload,
  open,
  onToggle,
  onOpen,
  accordionLocked = false,
  onBusyChange,
  onBlockedToggle,
  blockedHint = 0,
}: VariantManagerProps) {
  const [activeEdit, setActiveEdit] = useState<ActiveEdit>(null);

  const productColors = useMemo(() => getUniqueProductColors(variants), [variants]);
  const isBusy = activeEdit !== null;
  const canAddVariant = variantsFetched && productColors.length > 0;
  const showLoading = variantsLoading && !variantsFetched;

  useEffect(() => {
    onBusyChange?.(isBusy);
  }, [isBusy, onBusyChange]);

  const handleAddVariant = () => {
    if (!canAddVariant) return;
    onOpen();
    setActiveEdit({ type: "new" });
  };

  const handleStartEdit = (variantId: string) => {
    onOpen();
    setActiveEdit({ type: "edit", id: variantId });
  };

  const variantSummary = !variantsFetched
    ? "Talles, precio y stock"
    : `${variants.length} variante${variants.length !== 1 ? "s" : ""} registrada${variants.length !== 1 ? "s" : ""}.`;

  return (
    <AdminCollapsibleCard
      open={open}
      onToggle={onToggle}
      disabled={accordionLocked}
      onBlockedToggle={onBlockedToggle}
      contentId="variant-table"
      title={variantsFetched ? `Variantes (${variants.length})` : "Variantes"}
      description={
        open
          ? "Talles, precio y stock por variante."
          : variantSummary
      }
      action={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleAddVariant}
            disabled={accordionLocked || isBusy || !canAddVariant}
            title={
              canAddVariant
                ? undefined
                : variantsFetched
                  ? "Agregá al menos un color antes de crear variantes"
                  : "Abrí la sección para cargar variantes"
            }
          >
            Agregar variante
          </Button>
        }
      >
        {showLoading ? (
          <AdminDataTableSkeleton
            columns={[
              "Imagen",
              "Talle / Color",
              "SKU",
              "Precio",
              "Stock",
              "Acciones",
            ]}
            rows={4}
            scrollClassName={cn(isBusy && "pb-6")}
            tableClassName="min-w-[40rem]"
            ariaLabel="Cargando variantes"
          />
        ) : variantsError ? (
          <p className="p-4 text-sm text-red-600 sm:p-6">{variantsError}</p>
        ) : (
        <AdminDataTable
        id="variant-table"
        scrollClassName={cn(isBusy && "pb-6")}
        tableClassName="min-w-[40rem]"
        columns={[
          "Imagen",
          "Talle / Color",
          "SKU",
          "Precio",
          "Stock",
          "Acciones",
        ]}
      >
        {activeEdit?.type === "new" && (
          <NewVariantRow
            productId={productId}
            colors={productColors}
            onCancel={() => setActiveEdit(null)}
            onSuccess={() => setActiveEdit(null)}
            onVariantsReload={onVariantsReload}
            blockedHint={blockedHint}
          />
        )}
        {variants.map((variant) => {
          const isEditing =
            activeEdit?.type === "edit" && activeEdit.id === variant.id;

          return (
            <VariantEditRow
              key={variant.id}
              variant={variant}
              colors={productColors}
              isEditing={isEditing}
              editDisabled={isBusy && !isEditing}
              onStartEdit={() => handleStartEdit(variant.id)}
              onCancelEdit={() => setActiveEdit(null)}
              onVariantsReload={onVariantsReload}
              blockedHint={blockedHint}
              onBlockedToggle={onBlockedToggle}
            />
          );
        })}
        </AdminDataTable>
        )}
    </AdminCollapsibleCard>
  );
}
