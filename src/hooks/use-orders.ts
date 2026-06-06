"use client";

import { useQuery } from "@tanstack/react-query";

import type { Order, OrderStatus } from "@/lib/types";
import { fetchJson, qs } from "./fetcher";

export interface UseOrdersParams {
  status?: OrderStatus;
  customerId?: string;
  limit?: number;
}

/**
 * Orders for the command center, newest-first. Polls so a storefront checkout
 * appears in the operator's Orders list within seconds (same in-memory store).
 */
export function useOrders(params: UseOrdersParams = {}) {
  return useQuery<Order[]>({
    queryKey: ["dashboard", "orders", params],
    queryFn: () =>
      fetchJson<Order[]>(
        `/api/dashboard/orders${qs({
          status: params.status,
          customerId: params.customerId,
          limit: params.limit,
        })}`,
      ),
    refetchInterval: 15_000,
  });
}
