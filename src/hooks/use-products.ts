"use client";

import { useQuery } from "@tanstack/react-query";

import type { ProductPerformance } from "@/app/api/dashboard/products/route";
import { fetchJson } from "./fetcher";

/** Product catalog enriched with realized sales performance, best sellers first. */
export function useProducts() {
  return useQuery<ProductPerformance[]>({
    queryKey: ["dashboard", "products"],
    queryFn: () => fetchJson<ProductPerformance[]>("/api/dashboard/products"),
  });
}

export type { ProductPerformance };
