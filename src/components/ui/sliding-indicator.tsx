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

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Measure active item relative to the list (works for nested links under Config).
 */
function measureSelectedBox(
  list: HTMLElement,
): SlidingIndicatorBox | null {
  const active = list.querySelector<HTMLElement>(SELECTED_SELECTOR);
  if (!active) return null;

  const listRect = list.getBoundingClientRect();
  const activeRect = active.getBoundingClientRect();

  return {
    top: activeRect.top - listRect.top + list.scrollTop,
    left: activeRect.left - listRect.left + list.scrollLeft,
    width: activeRect.width,
    height: activeRect.height,
  };
}

export function useSlidingIndicator(activeKey: string): {
  listRef: RefObject<HTMLElement | null>;
  indicator: SlidingIndicatorBox | null;
  animate: boolean;
} {
  const listRef = useRef<HTMLElement | null>(null);
  const readyRef = useRef(false);
  const [indicator, setIndicator] = useState<SlidingIndicatorBox | null>(null);
  const [animate, setAnimate] = useState(false);

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

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      list.removeEventListener("scroll", update);
    };
  }, [activeKey]);

  return { listRef, indicator, animate };
}

export function SlidingIndicatorPill({
  indicator,
  animate,
  className,
  style,
  skipEnterReveal = false,
}: {
  indicator: SlidingIndicatorBox | null;
  animate: boolean;
  className?: string;
  style?: CSSProperties;
  /** Absolute pill — skip shell-nav-reveal stagger on sidebar first paint. */
  skipEnterReveal?: boolean;
}) {
  if (!indicator) return null;

  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute top-0 left-0 z-0",
        animate && "sliding-indicator-animate",
        skipEnterReveal && "shell-nav-reveal-skip",
        className,
      )}
      style={{
        width: indicator.width,
        height: indicator.height,
        transform: `translate(${indicator.left}px, ${indicator.top}px)`,
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
  const { listRef, indicator, animate } = useSlidingIndicator(activeKey);

  return (
    <div
      ref={listRef as RefObject<HTMLDivElement | null>}
      className={cn("relative", className)}
    >
      <SlidingIndicatorPill
        indicator={indicator}
        animate={animate}
        className={pillClassName}
      />
      {children}
    </div>
  );
}
