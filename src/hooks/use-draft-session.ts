"use client";

import { useCallback, useEffect, useState } from "react";
import { useExitPresence } from "@/hooks/use-exit-presence";
import { useHydrated } from "@/lib/use-hydrated";

export type DraftSessionInfo = {
  pending: boolean;
  itemCount: number;
};

/**
 * Modal draft session (Rocha pattern): keep form mounted while minimized only if
 * dirty (`itemCount > 0`). Clean close / Escape / backdrop ends the session when
 * clean. Discard always ends session; parent resets fields.
 */
export function useDraftSession({
  open: openProp,
  onOpenChange,
  itemCount = 0,
  onDraftChange,
  exitMs = 250,
  /** Restore minimized dirty session after remount / sessionStorage hydrate. */
  initialSessionActive = false,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Dirty score — pending UI only when > 0. */
  itemCount?: number;
  onDraftChange?: (draft: DraftSessionInfo) => void;
  exitMs?: number;
  initialSessionActive?: boolean;
}) {
  const isClient = useHydrated();
  const [sessionActive, setSessionActive] = useState(initialSessionActive);
  const [openInternal, setOpenInternal] = useState(false);
  const controlled = openProp !== undefined;
  const open = controlled ? Boolean(openProp) : openInternal;
  const dirty = itemCount > 0;

  const setOpen = useCallback(
    (v: boolean) => {
      if (v) {
        setSessionActive(true);
        if (controlled) onOpenChange?.(true);
        else setOpenInternal(true);
        return;
      }
      if (!dirty) setSessionActive(false);
      if (controlled) onOpenChange?.(false);
      else setOpenInternal(false);
    },
    [controlled, onOpenChange, dirty],
  );

  // Adjust during render (React): open or persisted session revives shell.
  if ((open || initialSessionActive) && !sessionActive) {
    setSessionActive(true);
  }

  const draftPending = sessionActive && dirty;

  useEffect(() => {
    onDraftChange?.({ pending: draftPending, itemCount });
  }, [draftPending, itemCount, onDraftChange]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const minimize = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const endSession = useCallback(() => {
    setSessionActive(false);
    if (controlled) onOpenChange?.(false);
    else setOpenInternal(false);
  }, [controlled, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        minimize();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, minimize]);

  const { present, exiting, animKey } = useExitPresence(open, exitMs);
  const showShell = isClient && (sessionActive || present);
  const showChip = isClient && draftPending && !open;

  return {
    open,
    setOpen,
    sessionActive,
    minimize,
    endSession,
    showShell,
    showChip,
    present,
    exiting,
    animKey,
  };
}
