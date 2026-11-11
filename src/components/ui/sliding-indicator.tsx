"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { cn } from "@/lib/utils";

export type SlidingIndicatorBox = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const SELECTED_SELECTOR =
  '[data-sliding-selected="true"], [aria-current="page"]';

/** Matches globals.css shell-nav-enter max delay (720ms) + duration (320ms). */
const SHELL_ENTER_FALLBACK_MS = 1100;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Layout offset relative to ancestor via offsetParent chain.
 * Ignores CSS transforms (unlike getBoundingClientRect) — critical while
 * shell-nav-reveal runs translateY on sidebar links.
 */
function offsetRelativeTo(
  element: HTMLElement,
  ancestor: HTMLElement,
): { top: number; left: number } | null {
  let top = 0;
  let left = 0;
  let node: HTMLElement | null = element;

  while (node && node !== ancestor) {
    top += node.offsetTop;
    left += node.offsetLeft;
    const parent = node.offsetParent as HTMLElement | null;
    if (!parent) return null;
    if (parent === ancestor) return { top, left };
    if (!ancestor.contains(parent)) return null;
    node = parent;
  }

  return node === ancestor ? { top, left } : null;
}

/**
 * Measure active item relative to the list (works for nested links under Config).
 */
function measureSelectedBox(
  list: HTMLElement,
): SlidingIndicatorBox | null {
  const active = list.querySelector<HTMLElement>(SELECTED_SELECTOR);
  if (!active) return null;

  const offset = offsetRelativeTo(active, list);
  if (offset) {
    return {
      top: offset.top,
      left: offset.left,
      width: active.offsetWidth,
      height: active.offsetHeight,
    };
  }

  // Fallback when offsetParent chain skips the list (unusual containing blocks).
  const listRect = list.getBoundingClientRect();
  const activeRect = active.getBoundingClientRect();

  return {
    top: activeRect.top - listRect.top + list.scrollTop,
    left: activeRect.left - listRect.left + list.scrollLeft,
    width: activeRect.width,
    height: activeRect.height,
  };
}

type UseSlidingIndicatorOptions = {
  /**
   * Desktop sidebar: hide pill until the active link's shell-nav-enter starts,
   * so the gray highlight does not paint before the label cascades in.
   */
  waitForShellEnter?: boolean;
};

export function useSlidingIndicator(
  activeKey: string,
  options: UseSlidingIndicatorOptions = {},
): {
  listRef: RefObject<HTMLElement | null>;
  indicator: SlidingIndicatorBox | null;
  animate: boolean;
  /** False while waiting for the active item cascade to start. */
  visible: boolean;
} {
  const { waitForShellEnter = false } = options;
  const listRef = useRef<HTMLElement | null>(null);
  const readyRef = useRef(false);
  const shellEnterDoneRef = useRef(!waitForShellEnter);
  const [indicator, setIndicator] = useState<SlidingIndicatorBox | null>(null);
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(!waitForShellEnter);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const update = () => {
      setIndicator(measureSelectedBox(list));
    };

    update();

    let frame = 0;
    if (!readyRef.current) {
      readyRef.current = true;
      frame = requestAnimationFrame(() => {
        setAnimate(!prefersReducedMotion());
      });
    } else {
      setAnimate(!prefersReducedMotion());
    }

    const observer = new ResizeObserver(update);
    observer.observe(list);
    for (const child of list.querySelectorAll<HTMLElement>("a, button")) {
      observer.observe(child);
    }

    list.addEventListener("scroll", update, { passive: true });
    list.addEventListener("animationend", update);

    let fallbackTimer = 0;
    const revealPill = () => {
      if (shellEnterDoneRef.current) return;
      shellEnterDoneRef.current = true;
      setVisible(true);
      update();
    };

    if (waitForShellEnter && !shellEnterDoneRef.current) {
      if (prefersReducedMotion()) {
        revealPill();
      } else {
        const active = list.querySelector<HTMLElement>(SELECTED_SELECTOR);
        const onAnimationStart = (event: AnimationEvent) => {
          if (event.target !== active) return;
          if (!event.animationName.includes("shell-nav-enter")) return;
          revealPill();
        };
        active?.addEventListener("animationstart", onAnimationStart);
        fallbackTimer = window.setTimeout(revealPill, SHELL_ENTER_FALLBACK_MS);

        return () => {
          if (frame) cancelAnimationFrame(frame);
          if (fallbackTimer) window.clearTimeout(fallbackTimer);
          observer.disconnect();
          list.removeEventListener("scroll", update);
          list.removeEventListener("animationend", update);
          active?.removeEventListener("animationstart", onAnimationStart);
        };
      }
    }

    return () => {
      if (frame) cancelAnimationFrame(frame);
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      observer.disconnect();
      list.removeEventListener("scroll", update);
      list.removeEventListener("animationend", update);
    };
  }, [activeKey, waitForShellEnter]);

  return { listRef, indicator, animate, visible };
}

export function SlidingIndicatorPill({
  indicator,
  animate,
  visible = true,
  className,
  style,
  skipEnterReveal = false,
}: {
  indicator: SlidingIndicatorBox | null;
  animate: boolean;
  /** When false, pill stays hidden (e.g. waiting for nav cascade). */
  visible?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Absolute pill — skip shell-nav translate; opacity gated by `visible`. */
  skipEnterReveal?: boolean;
}) {
  // Always mount a skip node so nth-child cascade delays stay stable when the
  // measured pill appears after the first layout pass.
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute top-0 left-0 z-0",
        animate && indicator && visible && "sliding-indicator-animate",
        skipEnterReveal && "shell-nav-reveal-skip",
        (!indicator || !visible) && "opacity-0",
        className,
      )}
      style={{
        width: indicator?.width ?? 0,
        height: indicator?.height ?? 0,
        transform: indicator
          ? `translate(${indicator.left}px, ${indicator.top}px)`
          : undefined,
        ...style,
      }}
    />
  );
}

type SlidingOptionGroupProps = {
  activeKey: string;
  className?: string;
  pillClassName: string;
  children: ReactNode;
};

/** Absolute selected pill that slides between single-select options. */
export function SlidingOptionGroup({
  activeKey,
  className,
  pillClassName,
  children,
}: SlidingOptionGroupProps) {
  const { listRef, indicator, animate, visible } =
    useSlidingIndicator(activeKey);

  return (
    <div
      ref={listRef as RefObject<HTMLDivElement | null>}
      className={cn("relative", className)}
    >
      <SlidingIndicatorPill
        indicator={indicator}
        animate={animate}
        visible={visible}
        className={pillClassName}
      />
      {children}
    </div>
  );
}
