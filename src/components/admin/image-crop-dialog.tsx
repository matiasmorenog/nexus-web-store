"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Cropper, { type Area } from "react-easy-crop";
import { Loader2 } from "lucide-react";
import {
  adminCardClass,
  adminCardHeaderClass,
} from "@/components/admin/admin-surface";
import { Button } from "@/components/ui/button";
import { PRODUCT_IMAGE } from "@/lib/images/presets";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

export type ImageCropCopy = {
  title: string;
  hint: string;
  zoom: string;
  cancel: string;
  confirm: string;
  applying: string;
};

type ImageCropDialogProps = {
  open: boolean;
  imageSrc: string;
  copy: ImageCropCopy;
  applying?: boolean;
  onCancel: () => void;
  onConfirm: (croppedAreaPixels: Area) => void;
};

type ImageCropSessionProps = {
  imageSrc: string;
  copy: ImageCropCopy;
  applying: boolean;
  onCancel: () => void;
  onConfirm: (croppedAreaPixels: Area) => void;
};

function ImageCropSession({
  imageSrc,
  copy,
  applying,
  onCancel,
  onConfirm,
}: ImageCropSessionProps) {
  const titleId = useId();
  const hintId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  useEffect(() => {
    cancelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !applying) onCancel();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [applying, onCancel]);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label={copy.cancel}
        className="absolute inset-0 bg-neutral-900/55 backdrop-blur-sm"
        onClick={applying ? undefined : onCancel}
        disabled={applying}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={hintId}
        className={cn(
          adminCardClass,
          "relative flex max-h-[100dvh] w-full flex-col overflow-hidden shadow-xl admin-panel-enter sm:max-h-[min(92dvh,880px)] sm:max-w-lg sm:rounded-xl",
          "rounded-t-2xl rounded-b-none sm:rounded-b-xl",
        )}
      >
        <div className={cn(adminCardHeaderClass, "shrink-0 space-y-1 px-4 py-3")}>
          <h2 id={titleId} className="text-base font-semibold text-neutral-900">
            {copy.title}
          </h2>
          <p id={hintId} className="text-sm text-neutral-500">
            {copy.hint}
          </p>
        </div>

        <div className="relative min-h-[min(58dvh,420px)] flex-1 bg-neutral-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={PRODUCT_IMAGE.aspectRatio}
            objectFit="contain"
            showGrid
            restrictPosition
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            classes={{
              containerClassName: "h-full",
            }}
          />
        </div>

        <div className="shrink-0 space-y-3 border-t border-neutral-200 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-neutral-600">
              {copy.zoom}
            </span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              disabled={applying}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="w-full accent-[var(--brand-primary)]"
            />
          </label>

          <div className="flex gap-2">
            <Button
              ref={cancelRef}
              type="button"
              variant="outline"
              className="flex-1"
              disabled={applying}
              onClick={onCancel}
            >
              {copy.cancel}
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={applying || !croppedAreaPixels}
              onClick={() => {
                if (croppedAreaPixels) onConfirm(croppedAreaPixels);
              }}
            >
              {applying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {copy.applying}
                </>
              ) : (
                copy.confirm
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ImageCropDialog({
  open,
  imageSrc,
  copy,
  applying = false,
  onCancel,
  onConfirm,
}: ImageCropDialogProps) {
  const mounted = useHydrated();

  if (!open || !mounted || !imageSrc) return null;

  const portalRoot = document.querySelector("[data-admin-ui]") ?? document.body;

  return createPortal(
    <ImageCropSession
      key={imageSrc}
      imageSrc={imageSrc}
      copy={copy}
      applying={applying}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />,
    portalRoot,
  );
}
