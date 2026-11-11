/**
 * Shared focus helpers for custom controls (date pickers, etc.).
 * Trigger/bordered fields match `Input` (ring-2 + offset).
 * Day cells / icon buttons use flush brand outline.
 */

export const BRAND_BORDER_ACTIVE =
  "border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)] ring-offset-1";

export const FOCUS_BRAND_BORDER =
  "focus:outline-none focus-visible:outline-none focus-visible:border-[var(--brand-primary)] focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-1";

export const FOCUS_BRAND_OUTLINE =
  "focus:outline-none focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)] focus-visible:outline-offset-0";

export const FOCUS_BRAND_PRIMARY =
  "focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-1";
