"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus } from "lucide-react";
import {
  AdminFormAlert,
  AdminFormGrid,
} from "@/components/admin/admin-form";
import {
  AdminDraftModal,
  AdminDraftModalBody,
  AdminDraftModalFooter,
  AdminDraftModalHeader,
  AdminDraftTrigger,
} from "@/components/ui/admin-draft-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { outlineToggleChipClassName } from "@/components/ui/picker-preset-chips";
import { Switch } from "@/components/ui/switch";
import { useDraftSession } from "@/hooks/use-draft-session";
import { STORE_AUDIENCES } from "@/lib/categories";
import { useAdminCreateDraftStore } from "@/stores/admin-create-draft-store";

const TITLE_ID = "category-create-title";

type AdminCategoryCreateFormProps = {
  chipClassName?: string;
};

/** Global host modal — stays mounted under admin layout. */
export function AdminCategoryCreateForm({
  chipClassName = "bottom-20",
}: AdminCategoryCreateFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const open = useAdminCreateDraftStore((s) => s.category.open);
  const sessionActive = useAdminCreateDraftStore((s) => s.category.sessionActive);
  const storeItemCount = useAdminCreateDraftStore((s) => s.category.itemCount);
  const savedValues = useAdminCreateDraftStore((s) => s.category.values);
  const savedAudiences = useAdminCreateDraftStore((s) => s.category.audiences);
  const setOpenStore = useAdminCreateDraftStore((s) => s.setOpen);
  const setSessionMeta = useAdminCreateDraftStore((s) => s.setSessionMeta);
  const patchValues = useAdminCreateDraftStore((s) => s.patchValues);
  const setAudiencesStore = useAdminCreateDraftStore((s) => s.setAudiences);
  const clearDraft = useAdminCreateDraftStore((s) => s.clearDraft);

  const [formKey, setFormKey] = useState(0);
  const [dirtyCount, setDirtyCount] = useState(() => {
    let n = 0;
    for (const [key, value] of Object.entries(savedValues)) {
      if (key === "showInNav" || key === "sortOrder") continue;
      if (value.trim()) n += 1;
    }
    return n;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAudiences, setSelectedAudiences] =
    useState<string[]>(savedAudiences);

  const itemCount = Math.max(
    dirtyCount + selectedAudiences.length,
    storeItemCount,
  );

  const onDraftChange = useCallback(
    (info: { pending: boolean; itemCount: number }) => {
      const subtitle =
        info.itemCount > 0
          ? `${info.itemCount} cambio${info.itemCount === 1 ? "" : "s"}`
          : "Sin datos aún";
      setSessionMeta("category", {
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
    onOpenChange: (next) => setOpenStore("category", next),
    itemCount,
    onDraftChange,
    initialSessionActive: sessionActive,
  });

  const refreshDirty = useCallback(() => {
    const form = formRef.current;
    if (!form) {
      setDirtyCount(0);
      return;
    }
    const data = new FormData(form);
    const values: Record<string, string> = {};
    let n = 0;
    for (const [key, value] of data.entries()) {
      if (typeof value !== "string") continue;
      values[key] = value;
      if (key === "showInNav" || key === "sortOrder") continue;
      if (value.trim()) n += 1;
    }
    setDirtyCount(n);
    patchValues("category", values);
  }, [patchValues]);

  const resetFields = useCallback(() => {
    setSelectedAudiences([]);
    setAudiencesStore([]);
    setError(null);
    setDirtyCount(0);
    clearDraft("category");
    setFormKey((k) => k + 1);
  }, [setAudiencesStore, clearDraft]);

  const discardDraft = () => {
    resetFields();
    endSession();
    clearDraft("category");
  };

  const toggleAudience = (slug: string) => {
    setSelectedAudiences((current) => {
      const next = current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug];
      setAudiencesStore(next);
      return next;
    });
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

      resetFields();
      endSession();
      clearDraft("category");
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

  const chipSubtitle =
    itemCount > 0
      ? `${itemCount} cambio${itemCount === 1 ? "" : "s"}`
      : "Sin datos aún";

  const v = (name: string, fallback = "") => savedValues[name] ?? fallback;

  if (!showShell && !sessionActive && !open) return null;

  return (
    <AdminDraftModal
      open={modalOpen}
      showShell={showShell || sessionActive}
      showChip={showChip || (sessionActive && !open && itemCount > 0)}
      exiting={exiting}
      animKey={animKey}
      labelledBy={TITLE_ID}
      onMinimize={minimize}
      onResume={() => setOpen(true)}
      maxWidthClassName="max-w-lg"
      chipClassName={chipClassName}
      chip={{
        title: "Categoría en curso",
        subtitle: chipSubtitle,
        icon: FolderPlus,
      }}
    >
      <form
        key={formKey}
        ref={formRef}
        onSubmit={handleSubmit}
        onInput={refreshDirty}
        onChange={refreshDirty}
        className="flex max-h-[min(92dvh,40rem)] flex-col"
      >
        <AdminDraftModalHeader
          titleId={TITLE_ID}
          title="Nueva categoría"
          description="Nombre, slug y visibilidad en la tienda."
        />
        <AdminDraftModalBody>
          {error ? (
            <AdminFormAlert variant="error">{error}</AdminFormAlert>
          ) : null}
          <AdminFormGrid>
            <div>
              <Label htmlFor="category-label">Nombre</Label>
              <Input
                id="category-label"
                name="label"
                placeholder="Remeras"
                required
                defaultValue={v("label")}
              />
            </div>
            <div>
              <Label htmlFor="category-slug">Slug (opcional)</Label>
              <Input
                id="category-slug"
                name="slug"
                placeholder="remeras"
                className="lowercase"
                defaultValue={v("slug")}
              />
            </div>
            <div>
              <Label htmlFor="category-sort">Orden</Label>
              <Input
                id="category-sort"
                name="sortOrder"
                type="number"
                defaultValue={v("sortOrder", "0")}
              />
            </div>
            <div className="flex items-center gap-2.5 sm:col-span-2">
              <Switch
                id="category-nav"
                name="showInNav"
                defaultChecked={v("showInNav", "on") === "on"}
              />
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
                      className={outlineToggleChipClassName(active)}
                      aria-pressed={active}
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
        </AdminDraftModalBody>
        <AdminDraftModalFooter>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={loading}
            onClick={minimize}
          >
            Minimizar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={loading}
            onClick={discardDraft}
          >
            Descartar
          </Button>
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Creando…" : "Crear categoría"}
          </Button>
        </AdminDraftModalFooter>
      </form>
    </AdminDraftModal>
  );
}

export function AdminCategoryCreateTrigger({
  className,
}: {
  className?: string;
}) {
  const pending = useAdminCreateDraftStore((s) => s.category.pending);
  const openDraft = useAdminCreateDraftStore((s) => s.openDraft);

  return (
    <AdminDraftTrigger
      onClick={() => openDraft("category")}
      pending={pending}
      idleLabel="Nueva categoría"
      pendingLabel="Continuar categoría"
      icon={FolderPlus}
      className={className ?? "w-full whitespace-nowrap sm:w-auto"}
    />
  );
}
