"use client";

import * as React from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Small uppercase mono label, e.g. "Revenue · 7d". */
  label: string;
  /** Pre-formatted value, e.g. formatCurrency(...) or formatNumber(...). */
  value: string;
  /**
   * Optional period-over-period change as a ratio (0.12 = +12%).
   * Positive renders text-positive, negative renders text-critical.
   */
  delta?: number;
  /** Optional caption under the delta, e.g. "vs prior 7d". */
  deltaLabel?: string;
  /**
   * If true, a negative delta is "good" (e.g. cart abandonment, bounce),
   * so the color mapping inverts. Default false.
   */
  invertDelta?: boolean;
  /** Optional sparkline series (just the numeric y-values). */
  sparkline?: number[];
}

function formatDelta(delta: number): string {
  const pct = (delta * 100).toFixed(1);
  const sign = delta > 0 ? "+" : "";
  return `${sign}${pct}%`;
}

const SPARK_ID = "omakase-metric-spark";

export function MetricCard({
  label,
  value,
  delta,
  deltaLabel,
  invertDelta = false,
  sparkline,
  className,
  ...props
}: MetricCardProps) {
  const hasDelta = typeof delta === "number" && Number.isFinite(delta);
  const isUp = hasDelta && delta > 0;
  const isFlat = hasDelta && delta === 0;
  // "good" when up (or down if inverted)
  const isGood = invertDelta ? !isUp : isUp;

  const sparkData = React.useMemo(
    () => (sparkline ?? []).map((y, i) => ({ i, y })),
    [sparkline],
  );

  return (
    <div
      className={cn(
        "flex flex-col justify-between gap-6 border border-hairline bg-card p-6",
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="label label-muted">{label}</span>
        {hasDelta && !isFlat && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-mono text-xs tabular-nums",
              isGood ? "text-positive" : "text-critical",
            )}
          >
            {isUp ? (
              <ArrowUpRight className="size-3.5" />
            ) : (
              <ArrowDownRight className="size-3.5" />
            )}
            {formatDelta(delta)}
          </span>
        )}
        {hasDelta && isFlat && (
          <span className="font-mono text-xs tabular-nums text-ink-muted">
            {formatDelta(delta)}
          </span>
        )}
      </div>

      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="display text-4xl tabular-nums leading-none">
            {value}
          </span>
          {deltaLabel && (
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted">
              {deltaLabel}
            </span>
          )}
        </div>

        {sparkData.length > 1 && (
          <div className="h-10 w-24 shrink-0" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={sparkData}
                margin={{ top: 2, right: 0, bottom: 2, left: 0 }}
              >
                <defs>
                  <linearGradient id={SPARK_ID} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--color-accent)"
                      stopOpacity={0.22}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--color-accent)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="y"
                  stroke="var(--color-accent)"
                  strokeWidth={1.5}
                  fill={`url(#${SPARK_ID})`}
                  isAnimationActive={false}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
