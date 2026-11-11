"use client";

import { useMemo, useState } from "react";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminSelect } from "@/components/admin/admin-form";
import { AdminStoreQrPreview } from "@/components/admin/admin-store-qr-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  buildQrDownloadFilename,
  type AdminQrProductOption,
} from "@/lib/admin-store-qr";
import {
  ADMIN_QR_COLOR_PRESETS,
  ADMIN_QR_FRAME_PRESETS,
  ADMIN_QR_MODULE_PRESETS,
  DEFAULT_ADMIN_QR_STYLE,
  type AdminQrColorId,
  type AdminQrFrameStyle,
  type AdminQrModuleStyle,
  type AdminQrStyle,
} from "@/lib/admin-store-qr-style";
import { cn } from "@/lib/utils";

type AdminStoreQrBuilderProps = {
  homeUrl: string;
  productBasePath: string;
  products: AdminQrProductOption[];
  brandPrefix: string;
  brandColor: string;
};

type TargetMode = "home" | "product";

function StyleChip({
  label,
  active,
  onClick,
  disabled,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-[var(--brand-primary)] bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]"
          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {label}
    </button>
  );
}

export function AdminStoreQrBuilder({
  homeUrl,
  productBasePath,
  products,
  brandPrefix,
  brandColor,
}: AdminStoreQrBuilderProps) {
  const [mode, setMode] = useState<TargetMode>("home");
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [style, setStyle] = useState<AdminQrStyle>(DEFAULT_ADMIN_QR_STYLE);

  const selected = useMemo(
    () => products.find((product) => product.id === productId) ?? null,
    [productId, products],
  );

  const url =
    mode === "home" || !selected
      ? homeUrl
      : `${homeUrl.replace(/\/$/, "")}${productBasePath}/${selected.slug}`;

  const filename = buildQrDownloadFilename(
    mode === "home" || !selected ? "inicio" : selected.slug,
  );

  const patchStyle = (patch: Partial<AdminQrStyle>) => {
    setStyle((prev) => ({ ...prev, ...patch }));
  };

  return (
    <AdminCard
      className="max-w-3xl"
      title="Generar QR"
      description="Elegí destino y estilo, después descargá el PNG."
    >
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_16.5rem]">
        <div className="space-y-5">
          <div
            className="flex gap-1 rounded-lg border border-neutral-200 bg-neutral-100 p-1"
            role="group"
            aria-label="Destino del QR"
          >
            <button
              type="button"
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                mode === "home"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-800",
              )}
              aria-pressed={mode === "home"}
              onClick={() => setMode("home")}
            >
              Inicio
            </button>
            <button
              type="button"
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                mode === "product"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-800",
              )}
              aria-pressed={mode === "product"}
              disabled={products.length === 0}
              onClick={() => setMode("product")}
            >
              Producto
            </button>
          </div>

          {mode === "product" ? (
            products.length === 0 ? (
              <p className="text-sm text-neutral-500">
                No hay productos activos para generar un QR.
              </p>
            ) : (
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-neutral-700">
                  Producto
                </span>
                <AdminSelect
                  value={productId}
                  onChange={(event) => setProductId(event.target.value)}
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </AdminSelect>
              </label>
            )
          ) : (
            <p className="text-sm text-neutral-500">
              El QR abre la home de tu tienda.
            </p>
          )}

          <div className="space-y-3 border-t border-neutral-100 pt-5">
            <p className="text-sm font-medium text-neutral-700">Color</p>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Color del QR"
            >
              {ADMIN_QR_COLOR_PRESETS.map((preset) => {
                const active = style.colorId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    title={preset.label}
                    aria-label={preset.label}
                    aria-pressed={active}
                    onClick={() =>
                      patchStyle({ colorId: preset.id as AdminQrColorId })
                    }
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full border-2 transition-shadow",
                      active
                        ? "border-[var(--brand-primary)] shadow-sm"
                        : "border-transparent hover:border-neutral-300",
                    )}
                  >
                    <span
                      className="size-6 rounded-full border border-black/10"
                      style={{ background: preset.swatch }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 border-t border-neutral-100 pt-5">
            <p className="text-sm font-medium text-neutral-700">Forma</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Forma">
              {ADMIN_QR_MODULE_PRESETS.map((preset) => (
                <StyleChip
                  key={preset.id}
                  label={preset.label}
                  active={style.moduleStyle === preset.id}
                  onClick={() =>
                    patchStyle({
                      moduleStyle: preset.id as AdminQrModuleStyle,
                    })
                  }
                />
              ))}
            </div>
          </div>

          <div className="space-y-3 border-t border-neutral-100 pt-5">
            <p className="text-sm font-medium text-neutral-700">Marco</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Marco">
              {ADMIN_QR_FRAME_PRESETS.map((preset) => (
                <StyleChip
                  key={preset.id}
                  label={preset.label}
                  active={style.frameStyle === preset.id}
                  onClick={() =>
                    patchStyle({
                      frameStyle: preset.id as AdminQrFrameStyle,
                    })
                  }
                />
              ))}
            </div>
            {style.frameStyle === "banner" ? (
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-neutral-700">
                  Frase del marco
                </span>
                <Input
                  value={style.framePhrase}
                  maxLength={18}
                  onChange={(event) =>
                    patchStyle({ framePhrase: event.target.value })
                  }
                  placeholder="SCAN ME"
                />
              </label>
            ) : null}
          </div>

          <div className="border-t border-neutral-100 pt-5">
            <div className="flex items-center gap-2.5">
              <Switch
                id="qr-show-logo"
                checked={style.showLogo}
                onChange={(event) =>
                  patchStyle({ showLogo: event.target.checked })
                }
              />
              <Label htmlFor="qr-show-logo" className="cursor-pointer">
                Logo en el centro (iniciales de {brandPrefix || "la tienda"})
              </Label>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-4">
          <AdminStoreQrPreview
            url={url}
            filename={filename}
            brandPrefix={brandPrefix}
            brandColor={brandColor}
            style={style}
            layout="panel"
          />
        </div>
      </div>
    </AdminCard>
  );
}
