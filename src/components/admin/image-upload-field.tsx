"use client";

import { ImageIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { discardStagedProductImage } from "@/lib/images/discard-staged-product-image";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ImageUploadFieldProps = {
  name: string;
  id?: string;
  label?: string;
  defaultValue?: string;
  /** Layout horizontal para formularios inline (ej. variantes en tabla). */
  compact?: boolean;
  className?: string;
};

export function ImageUploadField({
  name,
  id,
  label = "Imagen",
  defaultValue = "",
  compact = false,
  className,
}: ImageUploadFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const [imageUrl, setImageUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(Boolean(defaultValue));
  const committedUrlRef = useRef(defaultValue);
  const sessionUploadsRef = useRef(new Set<string>());

  useEffect(() => {
    committedUrlRef.current = defaultValue;
  }, [defaultValue]);

  useEffect(() => {
    const sessionUploads = sessionUploadsRef.current;

    return () => {
      for (const url of sessionUploads) {
        if (url !== committedUrlRef.current) {
          void discardStagedProductImage(url);
        }
      }
    };
  }, []);

  function discardSessionUpload(url: string | undefined) {
    if (!url || !sessionUploadsRef.current.has(url)) return;
    sessionUploadsRef.current.delete(url);
    void discardStagedProductImage(url);
  }

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body,
      });

      const data = (await response.json()) as {
        url?: string;
        error?: string;
        savedPercent?: number;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Error al subir la imagen");
      }

      if (data.url) {
        discardSessionUpload(imageUrl);
        sessionUploadsRef.current.add(data.url);
        setImageUrl(data.url);
        setShowUrlInput(false);
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Error al subir la imagen",
      );
    } finally {
      setUploading(false);
    }
  }

  const preview = (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-white",
        compact ? "h-28 w-[5.5rem]" : "h-44 w-32",
      )}
      aria-hidden={!imageUrl}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt="Vista previa"
          fill
          className="object-cover"
          sizes={compact ? "88px" : "128px"}
        />
      ) : (
        <ImageIcon
          className={cn(
            "text-neutral-300",
            compact ? "h-9 w-9" : "h-11 w-11",
          )}
          strokeWidth={1.25}
        />
      )}
    </div>
  );

  const controls = (
    <div className={cn("min-w-0 space-y-2", compact && "flex-1")}>
      <input
        id={fieldId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        disabled={uploading}
        className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-neutral-700 hover:file:bg-neutral-200"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
          event.target.value = "";
        }}
      />

      {uploading ? (
        <p className="text-xs text-neutral-500">Comprimiendo y subiendo…</p>
      ) : null}
      {error ? (
        <p className="text-xs text-[var(--brand-primary)]">{error}</p>
      ) : null}

      <button
        type="button"
        className="text-xs text-neutral-500 underline-offset-2 hover:underline"
        onClick={() => setShowUrlInput((open) => !open)}
      >
        {showUrlInput ? "Ocultar URL externa" : "Pegar URL externa"}
      </button>

      {showUrlInput ? (
        <Input
          value={imageUrl}
          onChange={(event) => {
            const next = event.target.value;
            discardSessionUpload(imageUrl);
            setImageUrl(next);
          }}
          placeholder="https://images.unsplash.com/..."
        />
      ) : null}

      {!compact ? (
        <p className="text-xs text-neutral-400">
          Se convierte a WebP (máx. 1200×1600 px). JPG/PNG/WebP/GIF hasta 8 MB.
        </p>
      ) : null}
    </div>
  );

  return (
    <div
      className={cn(
        "space-y-2",
        compact ? "sm:col-span-full" : "sm:col-span-2",
        className,
      )}
    >
      <Label htmlFor={fieldId}>{label}</Label>
      <input type="hidden" name={name} value={imageUrl} />

      {compact ? (
        <div className="flex items-start gap-3">
          {preview}
          {controls}
        </div>
      ) : (
        <div className="flex items-start gap-4">
          {preview}
          <div className="min-w-0 flex-1">{controls}</div>
        </div>
      )}
    </div>
  );
}
