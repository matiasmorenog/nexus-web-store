"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_ADMIN_QR_STYLE,
  getQrMonogram,
  renderStyledQrDataUrl,
  resolveAdminQrDarkColor,
  type AdminQrStyle,
} from "@/lib/admin-store-qr-style";
import { cn } from "@/lib/utils";

type AdminStoreQrPreviewProps = {
  url: string;
  filename: string;
  brandPrefix: string;
  /** Hex for “Marca” preset (e.g. #f13489). */
  brandColor?: string;
  style?: AdminQrStyle;
  /** `panel` Config · `inline` fila · `aside` columna en Datos del producto. */
  layout?: "panel" | "inline" | "aside";
  className?: string;
};

export function AdminStoreQrPreview({
  url,
  filename,
  brandPrefix,
  brandColor,
  style = DEFAULT_ADMIN_QR_STYLE,
  layout = "panel",
  className,
}: AdminStoreQrPreviewProps) {
  const [result, setResult] = useState<{
    key: string;
    dataUrl: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const renderSize = layout === "panel" ? 512 : 220;
  const monogram = getQrMonogram(brandPrefix);
  const styleKey = [
    url,
    style.colorId,
    style.showLogo,
    style.moduleStyle,
    style.frameStyle,
    style.framePhrase,
    monogram,
    brandColor ?? "",
    renderSize,
  ].join("|");

  useEffect(() => {
    let cancelled = false;
    const darkColor = resolveAdminQrDarkColor(style.colorId, brandColor);

    void renderStyledQrDataUrl({
      text: url,
      size: renderSize,
      darkColor,
      showLogo: style.showLogo,
      monogram,
      moduleStyle: style.moduleStyle,
      frameStyle: style.frameStyle,
      framePhrase: style.framePhrase,
    })
      .then((dataUrl) => {
        if (cancelled) return;
        setError(null);
        setResult({ key: styleKey, dataUrl });
      })
      .catch(() => {
        if (cancelled) return;
        setError("No se pudo generar el QR.");
        setResult(null);
      });

    return () => {
      cancelled = true;
    };
  }, [
    url,
    style.colorId,
    style.showLogo,
    style.moduleStyle,
    style.frameStyle,
    style.framePhrase,
    monogram,
    brandColor,
    renderSize,
    styleKey,
  ]);

  const dataUrl = result?.key === styleKey ? result.dataUrl : null;

  const download = () => {
    if (!dataUrl) return;
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = filename;
    anchor.click();
  };

  if (layout === "aside" || layout === "inline") {
    const aside = layout === "aside";
    return (
      <div
        className={cn(
          aside
            ? "flex w-full flex-col gap-3 rounded-lg border border-neutral-200 bg-neutral-50/60 p-3"
            : "flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200/80 bg-white p-3 shadow-sm",
          className,
        )}
      >
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-white",
            aside ? "mx-auto size-[9.5rem] p-2" : "size-[4.5rem]",
          )}
        >
          {error ? (
            <span className="px-1 text-center text-[10px] text-red-600">
              Error
            </span>
          ) : dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- data URL from qrcode
            <img
              src={dataUrl}
              alt={`Código QR para ${url}`}
              className="size-full rounded-[3px] object-contain"
            />
          ) : (
            <span className="text-[10px] text-neutral-400">…</span>
          )}
        </div>
        <div className={cn("min-w-0", aside ? "text-center" : "flex-1")}>
          {aside ? (
            <p className="text-sm font-medium text-neutral-900">QR del producto</p>
          ) : (
            <p className="text-sm font-medium text-neutral-900">QR del producto</p>
          )}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "mt-0.5 block truncate text-xs text-neutral-500 transition-colors hover:text-[var(--brand-primary)] hover:underline",
              aside && "mx-auto max-w-full",
            )}
            title={url}
          >
            {url}
          </a>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={aside ? "w-full" : "shrink-0"}
          disabled={!dataUrl}
          onClick={download}
        >
          <Download className="mr-1.5 h-4 w-4" />
          Descargar PNG
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="flex min-h-[14.5rem] w-full items-center justify-center rounded-lg border border-neutral-200 bg-white p-3 sm:min-h-[15.5rem]">
        {error ? (
          <p className="px-2 text-center text-sm text-red-600">{error}</p>
        ) : dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URL from qrcode
          <img
            src={dataUrl}
            alt={`Código QR para ${url}`}
            className="max-h-64 w-full object-contain"
          />
        ) : (
          <p className="text-sm text-neutral-400">Falta skeleton</p>
        )}
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full break-all text-center text-xs text-neutral-500 transition-colors hover:text-[var(--brand-primary)] hover:underline"
      >
        {url}
      </a>

      <Button
        type="button"
        variant="primary"
        size="sm"
        className="w-full"
        disabled={!dataUrl}
        onClick={download}
      >
        <Download className="mr-1.5 h-4 w-4" />
        Descargar PNG
      </Button>
    </div>
  );
}
