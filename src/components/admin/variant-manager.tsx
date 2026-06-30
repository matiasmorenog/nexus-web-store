"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ProductThumbnail } from "@/components/admin/product-thumbnail";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
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
  deleteProductColor,
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
import { getClientVariantLabels } from "@/lib/variant-labels";
import type { VariantLabels } from "@/lib/store-verticals/types";
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

function pluralPrimaryLabel(label: string) {
  if (label === "Color") return "Colores";
  if (label === "Sabor") return "Sabores";
  return `${label}s`;
}

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
  primaryLabel,
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
  primaryLabel: string;
}) {
  return (
    <BlockedEditHint blockedHint={blockedHint}>
      <RowEditEnter>
        <AdminForm onSubmit={onSubmit} className="space-y-4">
        <p className="text-sm font-medium text-neutral-800">{title}</p>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
          <div className="space-y-2">
            <Label htmlFor={`${formId}-color`}>Nombre del {primaryLabel.toLowerCase()}</Label>
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
  blockedHint = 0,
  variantLabels,
}: {
  productId: string;
  onCancel: () => void;
  onSuccess: () => void;
  onVariantsReload?: () => Promise<void>;
  blockedHint?: number;
  variantLabels: VariantLabels;
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
          title={`Nuevo ${variantLabels.primary.toLowerCase()}`}
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
          onCancel={onCancel}
          blockedHint={blockedHint}
          primaryLabel={variantLabels.primary}
        />
        <p className="mt-3 text-xs text-neutral-400">
          Se crea el {variantLabels.secondary.toLowerCase()}{" "}
          {variantLabels.secondaryInitial ?? "M"} con stock 0 para que puedas sumar más{" "}
          {variantLabels.secondary.toLowerCase()}s en variantes.
        </p>
      </AdminTableCell>
    </AdminTableRow>
  );
}

function ColorEditRow({
  productId,
  color,
  imageUrl,
  variantCount,
  hasOrders,
  isEditing,
  editDisabled,
  onStartEdit,
  onCancelEdit,
  onVariantsReload,
  onBlockedToggle,
  blockedHint = 0,
  variantLabels,
}: {
  productId: string;
  color: string;
  imageUrl: string;
  variantCount: number;
  hasOrders: boolean;
  isEditing: boolean;
  editDisabled: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onVariantsReload?: () => Promise<void>;
  onBlockedToggle?: () => void;
  blockedHint?: number;
  variantLabels: VariantLabels;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const canDelete = variantCount <= 1 && !hasOrders;

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

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteProductColor(productId, color);
      await onVariantsReload?.();
      setConfirmOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar el color");
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
            primaryLabel={variantLabels.primary}
          />
        </AdminTableCell>
      </AdminTableRow>
    );
  }

  return (
    <>
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
            {canDelete ? (
              <AdminTableIconAction
                label={`Eliminar color ${color}`}
                icon={Trash2}
                onClick={() => {
                  if (editDisabled) {
                    onBlockedToggle?.();
                    return;
                  }
                  setConfirmOpen(true);
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
      <AdminConfirmDialog
        open={confirmOpen}
        title="Eliminar color"
        description={`¿Eliminar el color "${color}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={loading}
        onConfirm={() => void handleDelete()}
        onCancel={() => {
          if (!loading) setConfirmOpen(false);
        }}
      />
    </>
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
  const variantLabels = getClientVariantLabels();
  const primaryPlural = pluralPrimaryLabel(variantLabels.primary);
  const [activeEdit, setActiveEdit] = useState<ColorEdit>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const productColors = useMemo(() => getUniqueProductColors(variants), [variants]);
  const colorImageMap = useMemo(() => buildColorImageMap(variants), [variants]);
  const colorStats = useMemo(() => {
    const map = new Map<string, { count: number; hasOrders: boolean }>();

    for (const variant of variants) {
      const key = normalizeVariantColor(variant.color);
      const current = map.get(key) ?? { count: 0, hasOrders: false };
      current.count += 1;
      if (variant.orderItemCount > 0) {
        current.hasOrders = true;
      }
      map.set(key, current);
    }

    return map;
  }, [variants]);
  const isBusy = activeEdit !== null;
  const colorSummary = !variantsFetched
    ? `Fotos por ${variantLabels.primary.toLowerCase()} del producto`
    : productColors.length === 0
      ? `Sin ${primaryPlural.toLowerCase()} cargados`
      : `${productColors.length} ${primaryPlural.toLowerCase()}`;

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
      title={primaryPlural}
      description={
        open
          ? `Una foto por ${variantLabels.primary.toLowerCase()}; los ${variantLabels.secondary.toLowerCase()}s se agregan en variantes.`
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
          Agregar {variantLabels.primary.toLowerCase()}
        </Button>
      }
    >
      {showLoading ? (
        <AdminDataTableSkeleton
          columns={["Imagen", variantLabels.primary, "Acciones"]}
          rows={3}
          tableClassName="min-w-[24rem]"
          ariaLabel={`Cargando ${primaryPlural.toLowerCase()}`}
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
            columns={["Imagen", variantLabels.primary, "Acciones"]}
          >
            {activeEdit?.type === "new" ? (
              <NewColorRow
                productId={productId}
                onCancel={() => setActiveEdit(null)}
                onSuccess={() => {
                  setActiveEdit(null);
                  setSuccess(`${variantLabels.primary} agregado`);
                }}
                onVariantsReload={onVariantsReload}
                blockedHint={blockedHint}
                variantLabels={variantLabels}
              />
            ) : null}

            {productColors.length === 0 && activeEdit?.type !== "new" ? (
              <AdminTableRow className="hover:bg-transparent">
                <AdminTableCell
                  colSpan={3}
                  className="px-4 py-8 text-center text-sm text-neutral-500 sm:px-6"
                >
                  Todavía no hay {primaryPlural.toLowerCase()}. Usá &quot;Agregar{" "}
                  {variantLabels.primary.toLowerCase()}&quot; para cargar el primero.
                </AdminTableCell>
              </AdminTableRow>
            ) : (
              productColors.map((color) => {
                const isEditing =
                  activeEdit?.type === "edit" && activeEdit.color === color;
                const stats = colorStats.get(normalizeVariantColor(color));

                return (
                  <ColorEditRow
                    key={color}
                    productId={productId}
                    color={color}
                    imageUrl={
                      colorImageMap.get(normalizeVariantColor(color)) ?? ""
                    }
                    variantCount={stats?.count ?? 0}
                    hasOrders={stats?.hasOrders ?? false}
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
                    variantLabels={variantLabels}
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
  variantLabels,
}: {
  formId: string;
  values?: Partial<VariantFormValues>;
  colors: string[];
  variantLabels: VariantLabels;
}) {
  return (
    <AdminFormGrid columns={4} className="gap-3">
      <div>
        <Label htmlFor={`${formId}-color`}>{variantLabels.primary}</Label>
        <select
          id={`${formId}-color`}
          name="color"
          className={adminSelectClass}
          defaultValue={values?.color ?? ""}
          required
        >
          <option value="" disabled>
            Seleccionar {variantLabels.primary.toLowerCase()}
          </option>
          {colors.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor={`${formId}-size`}>{variantLabels.secondary}</Label>
        <Input
          id={`${formId}-size`}
          name="size"
          defaultValue={values?.size ?? variantLabels.secondaryInitial ?? "M"}
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
  variantLabels,
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
  variantLabels: VariantLabels;
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
              variantLabels={variantLabels}
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
  variantLabels,
}: {
  productId: string;
  colors: string[];
  onCancel: () => void;
  onSuccess: () => void;
  onVariantsReload?: () => Promise<void>;
  blockedHint?: number;
  variantLabels: VariantLabels;
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
      variantLabels={variantLabels}
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
  variantLabels,
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
  variantLabels: VariantLabels;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

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
    setLoading(true);
    setError(null);
    try {
      await deleteVariant(variant.id);
      await onVariantsReload?.();
      setConfirmOpen(false);
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
        variantLabels={variantLabels}
      />
    );
  }

  return (
    <>
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
                  setConfirmOpen(true);
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
      <AdminConfirmDialog
        open={confirmOpen}
        title="Eliminar variante"
        description={`¿Eliminar la variante ${variant.size} / ${variant.color}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={loading}
        onConfirm={() => void handleDelete()}
        onCancel={() => {
          if (!loading) setConfirmOpen(false);
        }}
      />
    </>
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
  const variantLabels = getClientVariantLabels();
  const variantColumnLabel = `${variantLabels.secondary} / ${variantLabels.primary}`;
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
    ? `${variantLabels.secondary}s, precio y stock`
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
          ? `${variantLabels.secondary}s, precio y stock por variante.`
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
                  ? `Agregá al menos un ${variantLabels.primary.toLowerCase()} antes de crear variantes`
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
              variantColumnLabel,
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
          variantColumnLabel,
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
            variantLabels={variantLabels}
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
              variantLabels={variantLabels}
            />
          );
        })}
        </AdminDataTable>
        )}
    </AdminCollapsibleCard>
  );
}
