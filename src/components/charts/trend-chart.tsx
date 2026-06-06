"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";

import { cn } from "@/lib/utils";

export interface TrendPoint {
  /** X-axis label, e.g. an ISO date or "Mon". */
  label: string;
  /** Y value. */
  value: number;
}

export interface TrendChartProps
  extends React.HTMLAttributes<HTMLDivElement> {
  data: TrendPoint[];
  /** "area" (filled, default) or "line". */
  variant?: "area" | "line";
  /** Fixed pixel height of the plot. Default 220. */
  height?: number;
  /** Hide the x-axis ticks (e.g. for compact embeds). Default false. */
  hideXAxis?: boolean;
  /** Hide the y-axis ticks. Default false. */
  hideYAxis?: boolean;
  /** Format a y value for the axis + tooltip, e.g. formatCurrency. */
  formatValue?: (n: number) => string;
  /** Format an x label for the tooltip header. */
  formatLabel?: (label: string) => string;
  /** Series name shown in the tooltip. Default "Value". */
  seriesName?: string;
}

const GRADIENT_ID = "omakase-trend-fill";

// ---- Strictly-typed custom tooltip ---------------------------------------

interface TrendTooltipPayloadItem {
  value?: number;
  payload?: TrendPoint;
}

interface TrendTooltipProps {
  active?: boolean;
  payload?: TrendTooltipPayloadItem[];
  label?: string | number;
  seriesName: string;
  formatValue?: (n: number) => string;
  formatLabel?: (label: string) => string;
}

function TrendTooltip({
  active,
  payload,
  label,
  seriesName,
  formatValue,
  formatLabel,
}: TrendTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const raw = payload[0]?.value;
  if (typeof raw !== "number") return null;

  const labelText =
    label === undefined
      ? ""
      : formatLabel
        ? formatLabel(String(label))
        : String(label);
  const valueText = formatValue ? formatValue(raw) : String(raw);

  return (
    <div className="border border-panel bg-panel px-3 py-2 shadow-md">
      {labelText && (
        <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-paper-on-panel/60">
          {labelText}
        </div>
      )}
      <div className="mt-0.5 flex items-baseline gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-paper-on-panel/60">
          {seriesName}
        </span>
        <span className="serif text-base tabular-nums text-paper-on-panel">
          {valueText}
        </span>
      </div>
    </div>
  );
}

const AXIS_TICK = {
  fill: "var(--color-ink-muted)",
  fontFamily: "var(--font-mono)",
  fontSize: 10,
} as const;

export function TrendChart({
  data,
  variant = "area",
  height = 220,
  hideXAxis = false,
  hideYAxis = false,
  formatValue,
  formatLabel,
  seriesName = "Value",
  className,
  ...props
}: TrendChartProps) {
  const renderTooltip = React.useCallback(
    ({ active, payload, label }: TooltipContentProps) => {
      const items: TrendTooltipPayloadItem[] = (payload ?? []).map((p) => ({
        value: typeof p.value === "number" ? p.value : undefined,
        payload: p.payload as TrendPoint | undefined,
      }));
      return (
        <TrendTooltip
          active={active}
          payload={items}
          label={label as string | number | undefined}
          seriesName={seriesName}
          formatValue={formatValue}
          formatLabel={formatLabel}
        />
      );
    },
    [seriesName, formatValue, formatLabel],
  );

  const margin = { top: 8, right: 8, bottom: 0, left: 0 };

  const sharedAxes = (
    <>
      <CartesianGrid
        vertical={false}
        stroke="var(--color-hairline)"
        strokeDasharray="0"
      />
      <XAxis
        dataKey="label"
        hide={hideXAxis}
        tick={AXIS_TICK}
        tickLine={false}
        axisLine={{ stroke: "var(--color-hairline)" }}
        tickMargin={8}
        minTickGap={24}
      />
      <YAxis
        hide={hideYAxis}
        tick={AXIS_TICK}
        tickLine={false}
        axisLine={false}
        width={48}
        tickFormatter={
          formatValue ? (v: number) => formatValue(v) : undefined
        }
      />
      <Tooltip
        content={renderTooltip}
        cursor={{ stroke: "var(--color-ink-muted)", strokeWidth: 1 }}
      />
    </>
  );

  return (
    <div
      className={cn("w-full", className)}
      style={{ height }}
      {...props}
    >
      <ResponsiveContainer width="100%" height="100%">
        {variant === "area" ? (
          <AreaChart data={data} margin={margin}>
            <defs>
              <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-accent)"
                  stopOpacity={0.18}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-accent)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            {sharedAxes}
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--color-accent)"
              strokeWidth={1.75}
              fill={`url(#${GRADIENT_ID})`}
              dot={false}
              activeDot={{
                r: 3,
                fill: "var(--color-accent)",
                stroke: "var(--color-paper)",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        ) : (
          <LineChart data={data} margin={margin}>
            {sharedAxes}
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-accent)"
              strokeWidth={1.75}
              dot={false}
              activeDot={{
                r: 3,
                fill: "var(--color-accent)",
                stroke: "var(--color-paper)",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
