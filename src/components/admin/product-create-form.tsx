"use client";

import { useCallback, useRef, useState } from "react";
import { PackagePlus } from "lucide-react";
import {
  adminActionErrorMessage,
  throwIfAdminActionError,
} from "@/lib/admin-action-result";
import { getAdminProductErrors } from "@/lib/admin-product-errors";
import { createProduct } from "@/lib/admin-actions";
import {
  AdminFormAlert,
  AdminFormGrid,
  AdminTextarea,
} from "@/components/admin/admin-form";
import { ProductTaxonomyFields } from "@/components/admin/product-taxonomy-fields";
import { getAdminVariantLabels } from "@/lib/variant-labels";
import {
  adminProductOptions,
  getAdminProductsCopy,
  readAdminLocaleFromDocument,
} from "@/lib/admin-locale";
import { getClientStorefrontConfig } from "@/lib/store-slug-client";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import {
  AdminDraftModal,
  AdminDraftModalBody,
  AdminDraftModalFooter,
  AdminDraftModalHeader,
  AdminDraftTrigger,
} from "@/components/ui/admin-draft-modal";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDraftSession } from "@/hooks/use-draft-session";
import type { ProductCategoryDef } from "@/lib/store-verticals/types";
import { SIZELESS_SIZE_VALUE } from "@/lib/product-size";
import { useAdminCreateDraftStore } from "@/stores/admin-create-draft-store";

const TITLE_ID = "product-create-title";

const IGNORE_DIRTY_KEYS = new Set([
  "hasSize",
  "featured",
  "promo2x1",
  "size",
  "color",
  "stock",
]);

type ProductCreateFormProps = {
  /** 2x1 disponible: vertical con promo + módulo coupons activo. */
  promo2x1Selectable?: boolean;
  categories?: readonly ProductCategoryDef[];
  /** Stack chip above category chip when both minimized. */
  chipClassName?: string;
};

function scoreFormDirty(form: HTMLFormElement | null): number {
  if (!form) return 0;
  const data = new FormData(form);
  let n = 0;
  for (const [key, value] of data.entries()) {
    if (IGNORE_DIRTY_KEYS.has(key)) continue;
    if (typeof value === "string" && value.trim()) n += 1;
    if (value instanceof File && value.size > 0) n += 1;
  }
  return n;
}

function snapshotFormValues(form: HTMLFormElement | null): Record<string, string> {
  if (!form) return {};
  const data = new FormData(form);
  const values: Record<string, string> = {};
  for (const [key, value] of data.entries()) {
    if (typeof value === "string") values[key] = value;
  }
  return values;
}

/** Global host modal — stays mounted under admin layout. */
export function ProductCreateForm({
  promo2x1Selectable = false,
  categories,
  chipClassName = "bottom-4",
}: ProductCreateFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const open = useAdminCreateDraftStore((s) => s.product.open);
  const sessionActive = useAdminCreateDraftStore((s) => s.product.sessionActive);
  const storeItemCount = useAdminCreateDraftStore((s) => s.product.itemCount);
  const savedValues = useAdminCreateDraftStore((s) => s.product.values);
  const savedHasSize = useAdminCreateDraftStore((s) => s.product.hasSize);
  const setOpenStore = useAdminCreateDraftStore((s) => s.setOpen);
  const setSessionMeta = useAdminCreateDraftStore((s) => s.setSessionMeta);
  const patchValues = useAdminCreateDraftStore((s) => s.patchValues);
  const setHasSizeStore = useAdminCreateDraftStore((s) => s.setHasSize);
  const clearDraft = useAdminCreateDraftStore((s) => s.clearDraft);

  const [formKey, setFormKey] = useState(0);
  const [dirtyCount, setDirtyCount] = useState(() => {
    let n = 0;
    for (const [key, value] of Object.entries(savedValues)) {
      if (IGNORE_DIRTY_KEYS.has(key)) continue;
      if (value.trim()) n += 1;
    }
    return n;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const locale = readAdminLocaleFromDocument();
  const optionsCopy = adminProductOptions[locale];
  const productsCopy = getAdminProductsCopy(locale);
  const variantLabels = getAdminVariantLabels(locale);
  const errorsCopy = getAdminProductErrors(locale, variantLabels);
  const sizeToggle = getClientStorefrontConfig().features.productSizeToggle;
  const [hasSize, setHasSize] = useState(
    () => savedHasSize ?? !sizeToggle,
  );
  const showPromo2x1 = promo2x1Selectable;

  const onDraftChange = useCallback(
    (info: { pending: boolean; itemCount: number }) => {
      const subtitle =
        info.itemCount > 0
          ? `${info.itemCount} campo${info.itemCount === 1 ? "" : "s"}`
          : "Sin datos aún";
      setSessionMeta({
        pending: info.pending,
        itemCount: info.itemCount,
        chipSubtitle: subtitle,
      });
    },
    [setSessionMeta],
  );

  const {
    open: modalOpen,
    setOpen,
    minimize,
    endSession,
    showShell,
    showChip,
    exiting,
    animKey,
  } = useDraftSession({
    open,
    onOpenChange: setOpenStore,
    itemCount: Math.max(dirtyCount, storeItemCount),
    onDraftChange,
    initialSessionActive: sessionActive,
  });

  const refreshDirty = useCallback(() => {
    const count = scoreFormDirty(formRef.current);
    setDirtyCount(count);
    patchValues(snapshotFormValues(formRef.current));
  }, [patchValues]);

  const resetFields = useCallback(() => {
    setHasSize(!sizeToggle);
    setHasSizeStore(!sizeToggle);
    setError(null);
    setImageUploading(false);
    setDirtyCount(0);
    clearDraft();
    setFormKey((k) => k + 1);
  }, [sizeToggle, setHasSizeStore, clearDraft]);

  const discardDraft = () => {
    resetFields();
    endSession();
    clearDraft();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setError(null);
    try {
      throwIfAdminActionError(await createProduct(new FormData(form)));
      resetFields();
      endSession();
      clearDraft();
    } catch (err) {
      setError(adminActionErrorMessage(err, errorsCopy));
    } finally {
      setLoading(false);
    }
  };

  const chipSubtitle =
    dirtyCount > 0
      ? `${dirtyCount} campo${dirtyCount === 1 ? "" : "s"}`
      : "Sin datos aún";

  const v = (name: string, fallback = "") => savedValues[name] ?? fallback;

  // Keep shell alive while sessionActive even if closed (minimized).
  if (!showShell && !sessionActive && !open) return null;

  return (
    <AdminDraftModal
      open={modalOpen}
      showShell={showShell || sessionActive}
      showChip={showChip || (sessionActive && !open && dirtyCount > 0)}
      exiting={exiting}
      animKey={animKey}
      labelledBy={TITLE_ID}
      onMinimize={minimize}
      onResume={() => setOpen(true)}
      maxWidthClassName="max-w-2xl"
      chipClassName={chipClassName}
      chip={{
        title: "Producto en curso",
        subtitle: chipSubtitle,
        icon: PackagePlus,
      }}
    >
      <form
        key={formKey}
        ref={formRef}
        onSubmit={handleSubmit}
        onInput={refreshDirty}
        onChange={refreshDirty}
        className="flex max-h-[min(92dvh,52rem)] flex-col"
      >
        <AdminDraftModalHeader
          titleId={TITLE_ID}
          title={productsCopy.newProduct}
          description={productsCopy.createDescription}
        />
        <AdminDraftModalBody>
          <AdminFormGrid>
            <div className="sm:col-span-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={v("name")}
              />
            </div>
            <ProductTaxonomyFields
              categories={categories}
              defaultCategory={v("category")}
              defaultAudience={v("audience")}
            />
            <div className="sm:col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <AdminTextarea
                id="description"
                name="description"
                rows={3}
                required
                defaultValue={v("description")}
              />
            </div>
            <div>
              <Label htmlFor="price">Precio</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                required
                defaultValue={v("price")}
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                defaultValue={v("stock", "10")}
                required
              />
            </div>

            {sizeToggle ? (
              <div className="sm:col-span-2">
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
                  <Switch
                    id="hasSize"
                    name="hasSize"
                    checked={hasSize}
                    onChange={(event) => {
                      setHasSize(event.target.checked);
                      setHasSizeStore(event.target.checked);
                    }}
                  />
                  {optionsCopy.sizeToggle}
                </label>
                <p className="mt-1.5 text-xs text-neutral-500">
                  {optionsCopy.sizeToggleHint}
                </p>
              </div>
            ) : (
              <input type="hidden" name="hasSize" value="on" />
            )}

            {hasSize ? (
              <div>
                <Label htmlFor="size">
                  {optionsCopy.sizeInitial(variantLabels.secondary)}
                </Label>
                <Input
                  id="size"
                  name="size"
                  defaultValue={
                    v("size") || variantLabels.secondaryInitial || "M"
                  }
                  required
                />
              </div>
            ) : (
              <input type="hidden" name="size" value={SIZELESS_SIZE_VALUE} />
            )}

            <div>
              <Label htmlFor="color">
                {optionsCopy.primaryInitial(variantLabels.primary)}
              </Label>
              <Input
                id="color"
                name="color"
                defaultValue={
                  v("color") || variantLabels.primaryInitial || "Negro"
                }
                required
              />
            </div>
            <ImageUploadField
              name="imageUrl"
              id="imageUrl"
              label={`Imagen del ${variantLabels.primary.toLowerCase()}`}
              defaultValue={v("imageUrl")}
              onUploadingChange={setImageUploading}
            />
            <div className="flex items-center gap-2.5 sm:col-span-2">
              <Switch
                id="featured"
                name="featured"
                defaultChecked={v("featured") === "on"}
              />
              <Label htmlFor="featured" className="cursor-pointer">
                Destacado
              </Label>
            </div>
            {showPromo2x1 ? (
              <div className="flex items-center gap-2.5 sm:col-span-2">
                <Switch
                  id="promo2x1"
                  name="promo2x1"
                  defaultChecked={v("promo2x1") === "on"}
                />
                <Label htmlFor="promo2x1" className="cursor-pointer">
                  Promoción 2x1
                </Label>
              </div>
            ) : null}
          </AdminFormGrid>

          {error ? <AdminFormAlert variant="error">{error}</AdminFormAlert> : null}
        </AdminDraftModalBody>
        <AdminDraftModalFooter>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={loading || imageUploading}
            onClick={minimize}
          >
            Minimizar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={loading || imageUploading}
            onClick={discardDraft}
          >
            Descartar
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={loading || imageUploading}
          >
            {imageUploading
              ? errorsCopy.waitForUpload
              : loading
                ? "Guardando..."
                : "Crear producto"}
          </Button>
        </AdminDraftModalFooter>
      </form>
    </AdminDraftModal>
  );
}

export function AdminProductCreateTrigger({
  className,
}: {
  className?: string;
}) {
  const pending = useAdminCreateDraftStore((s) => s.product.pending);
  const openDraft = useAdminCreateDraftStore((s) => s.openDraft);
  const copy = getAdminProductsCopy(readAdminLocaleFromDocument());

  return (
    <AdminDraftTrigger
      size="sm"
      className={className}
      onClick={() => openDraft()}
      pending={pending}
      idleLabel={copy.newProduct}
      pendingLabel="Continuar producto"
      icon={PackagePlus}
    />
  );
}
