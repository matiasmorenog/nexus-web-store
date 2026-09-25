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
      const active = list.querySelector<HTMLElement>(SELECTED_SELECTOR);
      if (!active) {
        setIndicator(null);
        return;
      }
      setIndicator({
        top: active.offsetTop,
        left: active.offsetLeft,
        width: active.offsetWidth,
        height: active.offsetHeight,
      });
    };

    update();

    let frame = 0;
    if (!readyRef.current) {
      readyRef.current = true;
      frame = requestAnimationFrame(() => {
        setAnimate(
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        );
      });
    }

    const observer = new ResizeObserver(update);
    observer.observe(list);
    for (const child of list.querySelectorAll<HTMLElement>(
      ":scope > a, :scope > button",
    )) {
      observer.observe(child);
    }

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [activeKey]);

  return { listRef, indicator, animate };
}

export function SlidingIndicatorPill({
  indicator,
  animate,
  className,
  style,
}: {
  indicator: SlidingIndicatorBox | null;
  animate: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  if (!indicator) return null;

  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute top-0 left-0 z-0",
        animate && "sliding-indicator-animate",
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
