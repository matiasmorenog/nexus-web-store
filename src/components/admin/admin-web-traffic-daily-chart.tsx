"use client";

import { useEffect, useMemo, useState } from "react";
import type { WebAnalyticsDayPoint } from "@/lib/web-analytics";
import { cn } from "@/lib/utils";
import { easeOutExpo } from "@/components/admin/use-count-up";

type AdminWebTrafficDailyChartProps = {
  points: WebAnalyticsDayPoint[];
  seriesBy: "hour" | "day";
};

const PLOT = {
  top: 22,
  bottom: 8,
  height: 100,
  width: 100,
} as const;

const HORIZONTAL_INSET = 2.5;
const SERIES_STROKE = 2.5;
const TOOLTIP_FLIP_THRESHOLD = 28;
const CHART_WAIT_MS = 320;
const CHART_LINE_DRAW_MS = 1100;

type ChartPhase = "waiting" | "animating" | "complete";

type PlotPoint = {
  x: number;
  y: number;
  point: WebAnalyticsDayPoint;
};

function formatCount(value: number): string {
  return new Intl.NumberFormat("es-AR").format(value);
}

function bucketX(index: number, count: number): number {
  if (count === 1) return PLOT.width / 2;
  const span = PLOT.width - HORIZONTAL_INSET * 2;
  return HORIZONTAL_INSET + (index / (count - 1)) * span;
}

function buildPlotPoints(
  data: WebAnalyticsDayPoint[],
  maxPageviews: number,
): PlotPoint[] {
  const plotHeight = PLOT.height - PLOT.top - PLOT.bottom;
  return data.map((point, index) => ({
    x: bucketX(index, data.length),
    y: PLOT.top + plotHeight - (point.pageviews / maxPageviews) * plotHeight,
    point,
  }));
}

function buildFullPaths(plotPoints: PlotPoint[], bottomY: number) {
  const linePath = plotPoints
    .map((plot, index) => `${index === 0 ? "M" : "L"} ${plot.x} ${plot.y}`)
    .join(" ");

  const first = plotPoints[0];
  const last = plotPoints[plotPoints.length - 1];
  const areaPath = [
    linePath,
    `L ${last.x} ${bottomY}`,
    `L ${first.x} ${bottomY}`,
    "Z",
  ].join(" ");

  return { linePath, areaPath };
}

function buildPartialPaths(
  plotPoints: PlotPoint[],
  progress: number,
  bottomY: number,
) {
  if (plotPoints.length === 0) {
    return { linePath: "", areaPath: "" };
  }

  if (plotPoints.length === 1 || progress >= 1) {
    return buildFullPaths(plotPoints, bottomY);
  }

  if (progress <= 0) {
    return { linePath: "", areaPath: "" };
  }

  const segments: { from: PlotPoint; to: PlotPoint; length: number }[] = [];
  for (let index = 1; index < plotPoints.length; index += 1) {
    const from = plotPoints[index - 1];
    const to = plotPoints[index];
    segments.push({
      from,
      to,
      length: Math.hypot(to.x - from.x, to.y - from.y),
    });
  }

  const totalLength = segments.reduce((sum, segment) => sum + segment.length, 0);
  const targetLength = totalLength * progress;
  const parts = [`M ${plotPoints[0].x} ${plotPoints[0].y}`];
  let covered = 0;
  let endX = plotPoints[0].x;
  let endY = plotPoints[0].y;

  for (const segment of segments) {
    if (covered + segment.length <= targetLength) {
      parts.push(`L ${segment.to.x} ${segment.to.y}`);
      covered += segment.length;
      endX = segment.to.x;
      endY = segment.to.y;
      continue;
    }

    if (targetLength > covered) {
      const t = (targetLength - covered) / segment.length;
      endX = segment.from.x + (segment.to.x - segment.from.x) * t;
      endY = segment.from.y + (segment.to.y - segment.from.y) * t;
      parts.push(`L ${endX} ${endY}`);
    }
    break;
  }

  const linePath = parts.join(" ");
  const areaPath = [
    linePath,
    `L ${endX} ${bottomY}`,
    `L ${plotPoints[0].x} ${bottomY}`,
    "Z",
  ].join(" ");

  return { linePath, areaPath };
}

function TrafficLineSvg({
  plotPoints,
  phase,
}: {
  plotPoints: PlotPoint[];
  phase: ChartPhase;
}) {
  const [drawProgress, setDrawProgress] = useState(0);
  const plotHeight = PLOT.height - PLOT.top - PLOT.bottom;
  const bottomY = PLOT.top + plotHeight;

  useEffect(() => {
    let frame = 0;

    if (phase === "waiting") {
      frame = requestAnimationFrame(() => setDrawProgress(0));
      return () => cancelAnimationFrame(frame);
    }

    if (phase === "complete") {
      frame = requestAnimationFrame(() => setDrawProgress(1));
      return () => cancelAnimationFrame(frame);
    }

    if (plotPoints.length === 0) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      frame = requestAnimationFrame(() => setDrawProgress(1));
      return () => cancelAnimationFrame(frame);
    }

    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / CHART_LINE_DRAW_MS, 1);
      setDrawProgress(easeOutExpo(progress));
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [phase, plotPoints]);

  const paths =
    phase === "complete"
      ? buildFullPaths(plotPoints, bottomY)
      : buildPartialPaths(plotPoints, drawProgress, bottomY);

  const showSeries =
    phase !== "waiting" && drawProgress > 0 && paths.linePath.length > 0;

  return (
    <svg
      viewBox={`0 0 ${PLOT.width} ${PLOT.height}`}
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      aria-hidden
    >
      <defs>
        <linearGradient id="traffic-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = PLOT.top + plotHeight * (1 - ratio);
        return (
          <line
            key={ratio}
            x1={0}
            x2={PLOT.width}
            y1={y}
            y2={y}
            className="stroke-neutral-100"
            strokeWidth={0.4}
          />
        );
      })}

      <g style={{ opacity: showSeries ? 1 : 0 }}>
        <path d={paths.areaPath} fill="url(#traffic-area)" />
        <path
          d={paths.linePath}
          fill="none"
          className="stroke-[var(--brand-primary)]"
          strokeWidth={SERIES_STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  );
}

function ChartTooltip({
  plot,
  showBelow,
}: {
  plot: PlotPoint;
  showBelow: boolean;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute z-20 w-max max-w-[10rem] -translate-x-1/2 rounded-lg border border-neutral-200/80 bg-white px-3 py-2 text-center shadow-md",
        showBelow ? "translate-y-2" : "-translate-y-full -mt-2",
      )}
      style={{
        left: `${plot.x}%`,
        top: `${plot.y}%`,
      }}
    >
      <p className="text-xs font-semibold text-neutral-900">
        {formatCount(plot.point.pageviews)} vistas
      </p>
      <p className="mt-0.5 text-[11px] font-medium text-neutral-500">
        {formatCount(plot.point.visitors)} visitante
        {plot.point.visitors !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

export function AdminWebTrafficDailyChart({
  points,
  seriesBy,
}: AdminWebTrafficDailyChartProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [chartPhase, setChartPhase] = useState<ChartPhase>("waiting");

  const maxPageviews = Math.max(...points.map((point) => point.pageviews), 1);
  const hasData = points.some((point) => point.pageviews > 0);

  const plotPoints = useMemo(
    () => buildPlotPoints(points, maxPageviews),
    [points, maxPageviews],
  );

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let startAnim: number | undefined;
    let finish: number | undefined;
    let waitingFrame = 0;

    waitingFrame = requestAnimationFrame(() => {
      setChartPhase("waiting");

      if (reducedMotion) {
        requestAnimationFrame(() => setChartPhase("complete"));
        return;
      }

      startAnim = window.setTimeout(() => {
        setChartPhase("animating");
      }, CHART_WAIT_MS);

      finish = window.setTimeout(() => {
        setChartPhase("complete");
      }, CHART_WAIT_MS + CHART_LINE_DRAW_MS);
    });

    return () => {
      cancelAnimationFrame(waitingFrame);
      if (startAnim) window.clearTimeout(startAnim);
      if (finish) window.clearTimeout(finish);
    };
  }, [points, seriesBy]);

  const activePlot =
    plotPoints.find((plot) => plot.point.date === activeKey) ?? null;
  const showTooltipBelow = activePlot
    ? activePlot.y < TOOLTIP_FLIP_THRESHOLD
    : false;

  const labelStep =
    seriesBy === "hour"
      ? points.length > 12
        ? 3
        : 2
      : points.length > 14
        ? 3
        : points.length > 8
          ? 2
          : 1;

  if (points.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-neutral-500">
        Sin serie en este período.
      </p>
    );
  }

  if (!hasData) {
    return (
      <p className="py-10 text-center text-sm text-neutral-500">
        Sin pageviews en este período.
      </p>
    );
  }

  return (
    <div>
      <p className="mb-2 text-xs text-neutral-400">
        Pasá el mouse sobre un punto para ver vistas y visitantes.
      </p>

      <div
        key={`${seriesBy}-${points[0]?.date}-${points[points.length - 1]?.date}`}
        className="relative h-44 overflow-visible sm:h-48"
      >
        <TrafficLineSvg plotPoints={plotPoints} phase={chartPhase} />

        {plotPoints.map((plot, index) => {
          const isActive = activeKey === plot.point.date;
          const showDot = chartPhase === "complete";

          return (
            <button
              key={plot.point.date}
              type="button"
              className={cn(
                "absolute z-10 -translate-x-1/2 -translate-y-1/2 touch-manipulation",
                !showDot && "pointer-events-none",
              )}
              style={{
                left: `${plot.x}%`,
                top: `${plot.y}%`,
              }}
              onMouseEnter={() => setActiveKey(plot.point.date)}
              onMouseLeave={() => setActiveKey(null)}
              aria-label={`${plot.point.label}: ${formatCount(plot.point.pageviews)} vistas, ${formatCount(plot.point.visitors)} visitantes`}
              aria-hidden={!showDot}
              tabIndex={showDot ? 0 : -1}
            >
              <span
                className={cn(
                  "block rounded-full border-[var(--brand-primary)] bg-white transition-transform",
                  showDot && "admin-chart-dot-enter",
                  !showDot && "scale-0 opacity-0",
                  isActive ? "size-[17px] shadow-sm" : "size-3.5",
                )}
                style={{
                  animationDelay: showDot ? `${index * 55}ms` : undefined,
                  borderWidth: SERIES_STROKE,
                }}
              />
            </button>
          );
        })}

        {activePlot && activePlot.point.pageviews > 0 ? (
          <ChartTooltip plot={activePlot} showBelow={showTooltipBelow} />
        ) : null}
      </div>

      <div className="relative mt-2 h-5 w-full">
        {plotPoints.map((plot, index) => {
          const showLabel =
            index % labelStep === 0 || index === plotPoints.length - 1;
          if (!showLabel) return null;
          return (
            <span
              key={`${plot.point.date}-label`}
              className={cn(
                "absolute -translate-x-1/2 truncate text-center text-[11px] text-neutral-500",
                seriesBy === "hour" ? "max-w-10" : "max-w-[3.5rem]",
                activeKey === plot.point.date &&
                  "font-semibold text-[var(--brand-primary)]",
              )}
              style={{ left: `${plot.x}%` }}
            >
              {plot.point.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
