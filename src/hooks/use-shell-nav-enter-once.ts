"use client";

import { useLayoutEffect, useState } from "react";

export type ShellNavEnterState = {
  /** False while opacity-gated before cascade starts. */
  ready: boolean;
  /** Apply shell-nav-reveal (play cascade). */
  animate: boolean;
  /** Hide items at opacity 0 until reveal starts (avoids flash). */
  pending: boolean;
};

/**
 * Desktop sidebar cascade on each full page load.
 * Starts pending (hidden) → layout effect flips to reveal so CSS animation runs from opacity 0.
 * Pass `enabled=false` for the mobile drawer (no cascade).
 */
export function useShellNavEnterOnce(enabled = true): ShellNavEnterState {
  const [phase, setPhase] = useState<"idle" | "pending" | "reveal">(() =>
    enabled ? "pending" : "idle",
  );

  useLayoutEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- sync gate before paint */
    if (!enabled) {
      setPhase("idle");
      return;
    }
    setPhase("reveal");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [enabled]);

  return {
    ready: phase !== "pending",
    animate: phase === "reveal",
    pending: phase === "pending",
  };
}
