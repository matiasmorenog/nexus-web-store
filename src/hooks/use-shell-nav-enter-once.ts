"use client";

import { useEffect, useLayoutEffect, useState } from "react";

/** Max delay (720ms) + duration (320ms) from globals.css shell-nav-reveal. */
const SHELL_NAV_SETTLE_MS = 1100;

export type ShellNavEnterState = {
  /** False while opacity-gated before cascade starts. */
  ready: boolean;
  /** Apply shell-nav-reveal (play cascade). */
  animate: boolean;
  /** Hide items at opacity 0 until reveal starts (avoids flash). */
  pending: boolean;
  /**
   * True after the page-load cascade finished (or when cascade disabled).
   * Config submenu uses a short local stagger once settled — avoids nth-child
   * delays from the full nav list.
   */
  settled: boolean;
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
  const [settled, setSettled] = useState(!enabled);

  useLayoutEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- sync gate before paint */
    if (!enabled) {
      setPhase("idle");
      setSettled(true);
      return;
    }
    setPhase("reveal");
    setSettled(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [enabled]);

  useEffect(() => {
    if (!enabled || phase !== "reveal") return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) {
      setSettled(true);
      return;
    }

    const timer = window.setTimeout(() => setSettled(true), SHELL_NAV_SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [enabled, phase]);

  return {
    ready: phase !== "pending",
    animate: phase === "reveal",
    pending: phase === "pending",
    settled,
  };
}
