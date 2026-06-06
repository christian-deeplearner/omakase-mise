"use client";

import { useQuery } from "@tanstack/react-query";

import type { Customer } from "@/lib/types";
import { fetchJson, qs } from "./fetcher";

export interface UseCustomersParams {
  q?: string;
  limit?: number;
}

/** Customers ranked by lifetime value, with optional search. */
export function useCustomers(params: UseCustomersParams = {}) {
  return useQuery<Customer[]>({
    queryKey: ["dashboard", "customers", params],
    queryFn: () =>
      fetchJson<Customer[]>(
        `/api/dashboard/customers${qs({ q: params.q, limit: params.limit })}`,
      ),
  });
}
