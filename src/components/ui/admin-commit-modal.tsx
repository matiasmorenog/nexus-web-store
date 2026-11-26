"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useExitPresence } from "@/hooks/use-exit-presence";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

export {
  AdminDraftModalBody as AdminCommitModalBody,
  AdminDraftModalFooter as AdminCommitModalFooter,
  AdminDraftModalHeader as AdminCommitModalHeader,
} from "@/components/ui/admin-draft-modal";

const EXIT_MS = 250;

/**
 * Small admin modal: no minimize/draft.
 * Pristine → backdrop / Escape closes.
 * Dirty → shake + vibrate; close only via Descartar / submit.
 */
export function AdminCommitModal({
  open,
  dirty = false,
  onDismiss,
  labelledBy,
  maxWidthClassName = "max-w-lg",
  children,
}: {
  open: boolean;
  /** When false, outside/Escape dismisses. When true, shake instead. */
  dirty?: boolean;
  onDismiss: () => void;
  labelledBy: string;
  maxWidthClassName?: string;
  children: ReactNode;
}) {
  const isClient = useHydrated();
  const { present, exiting, animKey } = useExitPresence(open, EXIT_MS);
  const [shaking, setShaking] = useState(false);
  const [enterDone, setEnterDone] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setShaking(false);
      setEnterDone(false);
    }
  }

  const refuseDismiss = useCallback(() => {
    setShaking(false);
    requestAnimationFrame(() => setShaking(true));
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(40);
    }
  }, []);

  const handleDismissAttempt = useCallback(() => {
    if (dirty) {
      refuseDismiss();
      return;
    }
    onDismiss();
  }, [dirty, onDismiss, refuseDismiss]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        handleDismissAttempt();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, handleDismissAttempt]);

  if (!isClient || !present) return null;

  const portalRoot = document.querySelector("[data-admin-ui]") ?? document.body;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4",
        !open && "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        className={cn(
          "absolute inset-0 bg-neutral-900/45 backdrop-blur-sm transition-opacity duration-200",
          exiting || !open ? "opacity-0" : "opacity-100",
        )}
        aria-label={
          dirty ? "Cerrar no permitido — guardá o descartá" : "Cerrar"
        }
        onClick={handleDismissAttempt}
        tabIndex={open ? 0 : -1}
      />
      <div
        key={animKey}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onAnimationEnd={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.animationName === "admin-commit-modal-shake") {
            setShaking(false);
          }
          if (event.animationName === "admin-draft-modal-in") {
            setEnterDone(true);
          }
        }}
        className={cn(
          "relative z-[1] flex w-full flex-col overflow-hidden rounded-t-xl border border-neutral-200/80 bg-white shadow-xl sm:rounded-xl",
          maxWidthClassName,
          exiting
            ? "admin-draft-modal-exit"
            : shaking
              ? "admin-commit-modal-shake"
              : enterDone
                ? null
                : "admin-draft-modal-enter",
        )}
      >
        {children}
      </div>
    </div>,
    portalRoot,
  );
}
