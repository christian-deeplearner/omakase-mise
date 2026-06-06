"use client";

import * as React from "react";

import { FunnelChart } from "@/components/charts/funnel-chart";
import { TrendChart, type TrendPoint } from "@/components/charts/trend-chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useFunnel } from "@/hooks/use-kpis";
import { useOrders } from "@/hooks/use-orders";
import type { Order } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/utils";

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 30;

interface DailyRollup {
  revenue: TrendPoint[];
  orders: TrendPoint[];
}

/** Bucket orders into the last N UTC days, summing revenue and order counts. */
function rollupDaily(orders: Order[], days = WINDOW_DAYS): DailyRollup {
  const now = Date.now();
  // Anchor to the latest order so the seeded window is never empty.
  const latest = orders.reduce(
    (max, o) => Math.max(max, new Date(o.createdAt).getTime()),
    0,
  );
  const anchor = Math.max(now, latest);

  const revenueByDay = new Map<string, number>();
  const ordersByDay = new Map<string, number>();
  const labels: string[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(anchor - i * DAY_MS);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
    labels.push(key);
    revenueByDay.set(key, 0);
    ordersByDay.set(key, 0);
  }

  for (const o of orders) {
    if (o.status === "refunded" || o.status === "cancelled") continue;
    const key = new Date(o.createdAt).toISOString().slice(0, 10);
    if (!revenueByDay.has(key)) continue;
    revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + o.totalCents);
    ordersByDay.set(key, (ordersByDay.get(key) ?? 0) + 1);
  }

  return {
    revenue: labels.map((key) => ({
      label: key,
      value: revenueByDay.get(key) ?? 0,
    })),
    orders: labels.map((key) => ({
      label: key,
      value: ordersByDay.get(key) ?? 0,
    })),
  };
}

function shortDay(label: string): string {
  // label is YYYY-MM-DD
  const d = new Date(`${label}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(d);
}

function Panel({
  title,
  meta,
  children,
}: {
  title: string;
  meta: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-hairline bg-card p-6">
      <div className="mb-5 flex items-baseline justify-between">
        <span className="label">{title}</span>
        <span className="label label-muted">{meta}</span>
      </div>
      {children}
    </div>
  );
}

export function AnalyticsClient() {
  const funnel = useFunnel();
  const orders = useOrders({ limit: 500 });

  const rollup = React.useMemo(
    () => rollupDaily(orders.data ?? []),
    [orders.data],
  );

  return (
    <div className="flex flex-col gap-px">
      {/* Funnel waterfall */}
      <Panel title="Conversion Funnel" meta="Unique sessions · last 30 days">
        {funnel.isLoading || !funnel.data ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <FunnelChart stages={funnel.data} data-testid="analytics-funnel" />
        )}
      </Panel>

      {/* Trend with a revenue/orders toggle */}
      <div className="mt-px border border-hairline bg-card p-6">
        <Tabs defaultValue="revenue">
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <span className="label">Daily Trend</span>
            <TabsList>
              <TabsTrigger value="revenue" data-testid="trend-tab-revenue">
                Revenue
              </TabsTrigger>
              <TabsTrigger value="orders" data-testid="trend-tab-orders">
                Orders
              </TabsTrigger>
            </TabsList>
          </div>

          {orders.isLoading ? (
            <Skeleton className="h-[260px] w-full" />
          ) : (
            <>
              <TabsContent value="revenue">
                <TrendChart
                  data={rollup.revenue}
                  variant="area"
                  height={260}
                  seriesName="Revenue"
                  formatValue={(n) => formatCurrency(n)}
                  formatLabel={shortDay}
                  data-testid="analytics-trend-revenue"
                />
              </TabsContent>
              <TabsContent value="orders">
                <TrendChart
                  data={rollup.orders}
                  variant="line"
                  height={260}
                  seriesName="Orders"
                  formatValue={(n) => formatNumber(n)}
                  formatLabel={shortDay}
                  data-testid="analytics-trend-orders"
                />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}
