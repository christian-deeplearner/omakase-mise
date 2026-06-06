"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCustomers } from "@/hooks/use-customers";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";

/** Debounce a fast-changing value so we don't refetch on every keystroke. */
function useDebounced<T>(value: T, ms = 250): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export function CustomersClient() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounced(search);

  const { data, isLoading } = useCustomers({
    q: debouncedSearch.trim() || undefined,
  });

  const rows = data ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div className="relative w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
        <Input
          type="search"
          placeholder="Search name, email, or city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          data-testid="customers-search"
        />
      </div>

      <div className="border border-hairline bg-card">
        <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
          <span className="label label-muted">
            {isLoading
              ? "Loading…"
              : `${formatNumber(rows.length)} customer${rows.length === 1 ? "" : "s"}`}
          </span>
          <span className="label label-muted">Highest LTV first</span>
        </div>

        <Table data-testid="customers-table">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10 text-right">#</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead>Last Order</TableHead>
              <TableHead className="text-right">Lifetime Value</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  {Array.from({ length: 6 }).map((__, c) => (
                    <TableCell key={c}>
                      <Skeleton className="h-4 w-full max-w-[8rem]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="h-32 text-center">
                  <span className="label label-muted">No customers match</span>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((c, i) => (
                <TableRow
                  key={c.id}
                  data-testid="customers-row"
                  className="cursor-pointer"
                  onClick={() => router.push(`/customers/${c.id}`)}
                >
                  <TableCell className="text-right font-mono text-[11px] tabular-nums text-ink-muted">
                    {i + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <Link
                        href={`/customers/${c.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-ink underline-offset-4 hover:text-accent hover:underline"
                      >
                        {c.name}
                      </Link>
                      <span className="font-mono text-[11px] text-ink-muted">
                        {c.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-ink-muted">
                    {c.location}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm tabular-nums text-ink-muted">
                    {formatNumber(c.ordersCount)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-xs text-ink-muted">
                    {c.lastOrderAt ? (
                      formatDate(c.lastOrderAt)
                    ) : (
                      <Badge variant="muted">No orders</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm tabular-nums text-ink">
                    {formatCurrency(c.ltvCents)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
