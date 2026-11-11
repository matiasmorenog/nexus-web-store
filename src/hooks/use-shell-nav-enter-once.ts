"use client";

import { useState } from "react";

export type ShellNavEnterState = {
  /** Sidebar content can render (skip opacity gate). */
  ready: boolean;
  /** Play enter motion on this document load / mount. */
  animate: boolean;
};

/**
 * Cascade enter for the admin sidebar.
 * Plays on each full page load (fresh mount of the desktop shell).
 * Pass `enabled=false` for the mobile drawer so opening it does not re-cascade.
 */
export function useShellNavEnterOnce(enabled = true): ShellNavEnterState {
  const [animate] = useState(enabled);
  return { ready: true, animate };
}
