"use client";

import { useQuery } from "@tanstack/react-query";

import type { FunnelStage, Kpis } from "@/lib/types";
import type { ActivityItem } from "@/lib/data-layer/fake/kpis";
import { fetchJson, qs } from "./fetcher";

/** Headline KPIs for the overview dashboard. */
export function useKpis() {
  return useQuery<Kpis>({
    queryKey: ["dashboard", "kpis"],
    queryFn: () => fetchJson<Kpis>("/api/dashboard/kpis"),
    refetchInterval: 30_000,
  });
}

/** The conversion funnel (unique sessions per stage). */
export function useFunnel() {
  return useQuery<FunnelStage[]>({
    queryKey: ["dashboard", "funnel"],
    queryFn: () => fetchJson<FunnelStage[]>("/api/dashboard/funnel"),
  });
}

/** The merged orders + events activity feed (newest-first). */
export function useActivity(limit = 40) {
  return useQuery<ActivityItem[]>({
    queryKey: ["dashboard", "activity", limit],
    queryFn: () => fetchJson<ActivityItem[]>(`/api/dashboard/activity${qs({ limit })}`),
    refetchInterval: 15_000,
  });
}
