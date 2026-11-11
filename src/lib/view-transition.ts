import { flushSync } from "react-dom";

type ViewTransitionCapableDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Morph DOM updates with the View Transition API when available. */
export function runViewTransition(update: () => void): void {
  const doc = document as ViewTransitionCapableDocument;
  if (!doc.startViewTransition || prefersReducedMotion()) {
    update();
    return;
  }

  doc.startViewTransition(() => {
    flushSync(update);
  });
}
