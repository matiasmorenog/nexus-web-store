"use client";

import { ImageIcon } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Image from "next/image";
import {
  adminImageUpload,
  readAdminLocaleFromDocument,
  type AdminImageUploadErrorCode,
  type AdminLocale,
} from "@/lib/admin-locale";
import {
  compressImageForUpload,
  MAX_UPLOAD_BYTES,
} from "@/lib/images/compress-image-client";
import { IMAGE_PRESETS, PRODUCT_IMAGE } from "@/lib/images/presets";
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
  /** Lets the parent form block submit until the upload finishes. */
  onUploadingChange?: (uploading: boolean) => void;
};

const UPLOAD_TIMEOUT_MS = 60_000;

const subscribeNoop = () => () => {};
const serverLocale = (): AdminLocale => "es";

type UploadResponse = {
  url?: string;
  error?: string;
  code?: AdminImageUploadErrorCode;
  savedPercent?: number;
};

async function readUploadResponse(response: Response): Promise<UploadResponse | null> {
  try {
    return (await response.json()) as UploadResponse;
  } catch {
    return null;
  }
}

export function ImageUploadField({
  name,
  id,
  label = "Imagen",
  defaultValue = "",
  compact = false,
  className,
  onUploadingChange,
}: ImageUploadFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const locale = useSyncExternalStore(
    subscribeNoop,
    readAdminLocaleFromDocument,
    serverLocale,
  );
  const copy = adminImageUpload[locale];
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

  function setUploadingState(value: boolean) {
    setUploading(value);
    onUploadingChange?.(value);
  }

  async function handleFile(file: File) {
    setError(null);
    setUploadingState(true);

    const controller = new AbortController();
    let timeoutId: number | undefined;

    try {
      const upload = await compressImageForUpload(file);
      if (!PRODUCT_IMAGE.allowedMimeTypes.has(upload.type)) {
        setError(copy.errors.unsupportedFormat);
        return;
      }
      if (upload.size > MAX_UPLOAD_BYTES) {
        setError(copy.errors.tooLarge);
        return;
      }

      const body = new FormData();
      body.append("file", upload);

      timeoutId = window.setTimeout(
        () => controller.abort(),
        UPLOAD_TIMEOUT_MS,
      );
      let response: Response;
      try {
        response = await fetch("/api/admin/upload", {
          method: "POST",
          body,
          signal: controller.signal,
        });
      } catch (fetchError) {
        setError(
          controller.signal.aborted ? copy.timeout : copy.network,
        );
        console.error("Image upload request failed:", fetchError);
        return;
      }

      const data = await readUploadResponse(response);

      if (!response.ok) {
        console.error("Image upload rejected:", response.status, data?.error);
        if (data?.code && data.code in copy.errors) {
          setError(copy.errors[data.code]);
        } else if (response.status === 413) {
          setError(copy.errors.tooLarge);
        } else if (response.status === 401) {
          setError(copy.errors.unauthorized);
        } else {
          setError(copy.errors.failed);
        }
        return;
      }

      if (data?.url) {
        discardSessionUpload(imageUrl);
        sessionUploadsRef.current.add(data.url);
        setImageUrl(data.url);
        setShowUrlInput(false);
      } else {
        setError(copy.errors.failed);
      }
    } catch (uploadError) {
      console.error("Image upload failed:", uploadError);
      setError(copy.unreadable);
    } finally {
      window.clearTimeout(timeoutId);
      setUploadingState(false);
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
          alt={copy.preview}
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
        <p className="text-xs text-neutral-500">{copy.uploading}</p>
      ) : null}
      {error ? (
        <p className="text-xs text-[var(--brand-primary)]">{error}</p>
      ) : null}

      <button
        type="button"
        className="text-xs text-neutral-500 underline-offset-2 hover:underline"
        onClick={() => setShowUrlInput((open) => !open)}
      >
        {showUrlInput ? copy.hideUrl : copy.showUrl}
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
          {copy.helper(
            IMAGE_PRESETS.product.maxWidth,
            IMAGE_PRESETS.product.maxHeight,
          )}
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
