"use client";

import * as React from "react";

import { MetricCard } from "@/components/charts/metric-card";
import { FunnelChart } from "@/components/charts/funnel-chart";
import {
  ActivityFeed,
  type ActivityItem as FeedItem,
} from "@/components/charts/activity-feed";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivity, useFunnel, useKpis } from "@/hooks/use-kpis";
import type { ActivityItem as DataActivityItem } from "@/lib/data-layer/fake/kpis";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

// Map the data-layer activity item onto the ActivityFeed component's shape.
function toFeedItem(a: DataActivityItem): FeedItem {
  const title =
    a.amountCents !== null
      ? `${a.label} · ${formatCurrency(a.amountCents)}`
      : a.label;
  return { id: a.id, kind: a.kind, title, meta: a.detail, ts: a.ts };
}

function CardSkeleton() {
  return (
    <div className="flex h-[120px] flex-col justify-between border border-hairline bg-card p-6">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-9 w-28" />
    </div>
  );
}

export function OverviewClient() {
  const kpis = useKpis();
  const funnel = useFunnel();
  const activity = useActivity(24);

  return (
    <div className="flex flex-col gap-10">
      {/* KPI grid */}
      <section
        className="grid grid-cols-1 gap-px border border-hairline bg-hairline sm:grid-cols-2 xl:grid-cols-3"
        data-testid="kpi-grid"
      >
        {kpis.isLoading || !kpis.data ? (
          Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <MetricCard
              data-testid="kpi-orders-today"
              label="Orders · Today"
              value={formatNumber(kpis.data.ordersToday)}
              className="border-0"
            />
            <MetricCard
              data-testid="kpi-revenue-7d"
              label="Revenue · 7d"
              value={formatCurrency(kpis.data.revenue7dCents)}
              className="border-0"
            />
            <MetricCard
              data-testid="kpi-revenue-30d"
              label="Revenue · 30d"
              value={formatCurrency(kpis.data.revenue30dCents)}
              className="border-0"
            />
            <MetricCard
              data-testid="kpi-conversion"
              label="Conversion"
              value={formatPercent(kpis.data.conversionRate)}
              className="border-0"
            />
            <MetricCard
              data-testid="kpi-abandonment"
              label="Cart Abandonment"
              value={formatPercent(kpis.data.cartAbandonmentRate)}
              invertDelta
              className="border-0"
            />
            <MetricCard
              data-testid="kpi-aov"
              label="Avg Order Value"
              value={formatCurrency(kpis.data.aovCents)}
              className="border-0"
            />
          </>
        )}
      </section>

      {/* Funnel + activity */}
      <section className="grid grid-cols-1 gap-px border border-hairline bg-hairline lg:grid-cols-5">
        <div className="bg-card p-6 lg:col-span-3" data-testid="overview-funnel">
          <div className="mb-4 flex items-baseline justify-between">
            <span className="label">Conversion Funnel</span>
            <span className="label label-muted">Last 30 days</span>
          </div>
          {funnel.isLoading || !funnel.data ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <FunnelChart stages={funnel.data} />
          )}
        </div>

        <div className="bg-card p-6 lg:col-span-2">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="label">Live Activity</span>
            <span className="label label-muted">Newest first</span>
          </div>
          {activity.isLoading || !activity.data ? (
            <div className="flex flex-col gap-3 pt-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <ActivityFeed
              items={activity.data.map(toFeedItem)}
              className="max-h-[26rem] overflow-y-auto"
            />
          )}
        </div>
      </section>
    </div>
  );
}
