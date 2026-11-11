"use client";

import {
  useLayoutEffect,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

/** Brand tokens live on `[data-admin-ui]` (display:contents) — copy onto body portals. */
const DEFAULT_INHERIT_VARS = [
  "--brand-primary",
  "--brand-primary-soft",
  "--brand-primary-darker",
] as const;

type Options = {
  gapPx?: number;
  /** Prefer at least this width (px); expands left-aligned under the anchor. */
  minWidthPx?: number;
  /** Cap width (px). Use with date pickers so wide triggers don’t stretch the panel. */
  maxWidthPx?: number;
  /** Fixed panel width (px); ignores anchor width (still clamped to viewport). */
  widthPx?: number;
  /** CSS custom properties to copy from the anchor onto the floating panel. */
  inheritCssVars?: readonly string[];
};

function readCssVars(
  el: HTMLElement,
  names: readonly string[],
): Record<string, string> {
  const computed = getComputedStyle(el);
  const out: Record<string, string> = {};
  for (const name of names) {
    const value = computed.getPropertyValue(name).trim();
    if (value) out[name] = value;
  }
  return out;
}

/**
 * Fixed position under an anchor — for panels portaled to document.body
 * so ancestors with overflow/transform cannot clip or trap stacking.
 */
export function useAnchoredFloatingStyle(
  anchorRef: RefObject<HTMLElement | null>,
  open: boolean,
  options: Options = {},
): CSSProperties | undefined {
  const {
    gapPx = 4,
    minWidthPx,
    maxWidthPx,
    widthPx,
    inheritCssVars = DEFAULT_INHERIT_VARS,
  } = options;
  const [style, setStyle] = useState<CSSProperties | undefined>();

  useLayoutEffect(() => {
    if (!open) return;

    function update() {
      const el = anchorRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const viewportMax = Math.max(0, window.innerWidth - 16);
      let width =
        widthPx != null
          ? widthPx
          : Math.max(r.width, minWidthPx ?? 0);
      if (maxWidthPx != null) width = Math.min(width, maxWidthPx);
      width = Math.min(width, viewportMax);
      const left = Math.min(r.left, Math.max(8, window.innerWidth - width - 8));
      setStyle({
        position: "fixed",
        top: r.bottom + gapPx,
        left,
        width,
        zIndex: 110,
        ...readCssVars(el, inheritCssVars),
      });
    }

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [anchorRef, open, gapPx, minWidthPx, maxWidthPx, widthPx, inheritCssVars]);

  return open ? style : undefined;
}
