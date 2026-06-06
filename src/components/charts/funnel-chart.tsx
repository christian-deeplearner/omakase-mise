"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { formatNumber, formatPercent } from "@/lib/utils";
import type { FunnelStage } from "@/lib/types";

export interface FunnelChartProps
  extends React.HTMLAttributes<HTMLDivElement> {
  stages: FunnelStage[];
}

interface ComputedStage {
  stage: string;
  count: number;
  /** width fraction relative to the top-of-funnel (0..1). */
  widthFraction: number;
  /** conversion from the previous stage (0..1), null for the first stage. */
  stepRate: number | null;
  /** drop-off from previous stage (0..1), null for the first stage. */
  dropOff: number | null;
}

/**
 * Horizontal waterfall funnel. Each bar's width is proportional to the
 * top-of-funnel count; we annotate per-step conversion and drop-off.
 * Bars fade from solid accent at the top to softer accent deeper down.
 */
export function FunnelChart({ stages, className, ...props }: FunnelChartProps) {
  const computed = React.useMemo<ComputedStage[]>(() => {
    const top = stages[0]?.count ?? 0;
    return stages.map((s, i): ComputedStage => {
      const prev = i > 0 ? stages[i - 1].count : null;
      const stepRate =
        prev && prev > 0 ? s.count / prev : i === 0 ? null : 0;
      return {
        stage: s.stage,
        count: s.count,
        widthFraction: top > 0 ? s.count / top : 0,
        stepRate,
        dropOff: stepRate === null ? null : 1 - stepRate,
      };
    });
  }, [stages]);

  const stageCount = computed.length;

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      {computed.map((s, i) => {
        // accent opacity steps down as we descend the funnel
        const fillOpacity =
          stageCount > 1
            ? 1 - (i / (stageCount - 1)) * 0.55
            : 1;
        return (
          <div
            key={s.stage}
            className={cn(
              "group flex flex-col gap-2 py-4",
              i > 0 && "border-t border-hairline",
            )}
          >
            <div className="flex items-baseline justify-between gap-4">
              <span className="label">{s.stage}</span>
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-sm tabular-nums text-ink">
                  {formatNumber(s.count)}
                </span>
                {s.stepRate !== null && (
                  <span className="font-mono text-[11px] tabular-nums text-ink-muted">
                    {formatPercent(s.stepRate, 0)} carry
                  </span>
                )}
              </div>
            </div>

            <div className="relative h-7 w-full bg-paper">
              <div
                className="h-full bg-accent transition-[width] duration-500"
                style={{
                  width: `${Math.max(s.widthFraction * 100, 1.5)}%`,
                  opacity: fillOpacity,
                }}
              />
              {s.dropOff !== null && s.dropOff > 0 && (
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-[0.08em] text-critical">
                  −{formatPercent(s.dropOff, 0)} drop
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
