"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus } from "lucide-react";
import {
  AdminFormAlert,
  AdminFormGrid,
} from "@/components/admin/admin-form";
import {
  AdminCommitModal,
  AdminCommitModalBody,
  AdminCommitModalFooter,
  AdminCommitModalHeader,
} from "@/components/ui/admin-commit-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { outlineToggleChipClassName } from "@/components/ui/picker-preset-chips";
import { Switch } from "@/components/ui/switch";
import { STORE_AUDIENCES } from "@/lib/categories";

const TITLE_ID = "category-create-title";

function scoreCategoryDirty(
  form: HTMLFormElement | null,
  audiences: string[],
): boolean {
  if (audiences.length > 0) return true;
  if (!form) return false;
  const data = new FormData(form);
  const label = String(data.get("label") ?? "").trim();
  const slug = String(data.get("slug") ?? "").trim();
  const sortOrder = String(data.get("sortOrder") ?? "0").trim();
  const showInNav = data.get("showInNav") === "on";
  if (label || slug) return true;
  if (sortOrder !== "0" && sortOrder !== "") return true;
  if (!showInNav) return true;
  return false;
}

/** Commit modal (no draft/minimize). Shake only when dirty. */
export function AdminCategoryCreateControls() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [dirty, setDirty] = useState(false);

  const refreshDirty = useCallback((audiences = selectedAudiences) => {
    setDirty(scoreCategoryDirty(formRef.current, audiences));
  }, [selectedAudiences]);

  const resetAndClose = () => {
    setSelectedAudiences([]);
    setError(null);
    setDirty(false);
    setFormKey((key) => key + 1);
    setOpen(false);
  };

  const toggleAudience = (slug: string) => {
    setSelectedAudiences((current) => {
      const next = current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug];
      queueMicrotask(() => refreshDirty(next));
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

      resetAndClose();
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
    <>
      <Button
        type="button"
        size="sm"
        className="w-full whitespace-nowrap sm:w-auto"
        onClick={() => setOpen(true)}
      >
        <FolderPlus className="mr-1.5 h-4 w-4" aria-hidden />
        Nueva categoría
      </Button>

      <AdminCommitModal
        open={open}
        dirty={dirty}
        onDismiss={resetAndClose}
        labelledBy={TITLE_ID}
        maxWidthClassName="max-w-lg"
      >
        <form
          key={formKey}
          ref={formRef}
          onSubmit={handleSubmit}
          onInput={() => refreshDirty()}
          onChange={() => refreshDirty()}
          className="flex max-h-[min(92dvh,40rem)] flex-col"
        >
          <AdminCommitModalHeader
            titleId={TITLE_ID}
            title="Nueva categoría"
            description="Nombre, slug y visibilidad en la tienda."
          />
          <AdminCommitModalBody>
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
                />
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
          </AdminCommitModalBody>
          <AdminCommitModalFooter>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={loading}
              onClick={resetAndClose}
            >
              Descartar
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Creando…" : "Crear categoría"}
            </Button>
          </AdminCommitModalFooter>
        </form>
      </AdminCommitModal>
    </>
  );
}
