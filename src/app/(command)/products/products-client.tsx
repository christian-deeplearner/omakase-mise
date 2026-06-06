"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, Search } from "lucide-react";

import { ProductStatusBadge } from "@/components/ui/badge";
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
import { useProducts, type ProductPerformance } from "@/hooks/use-products";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

function SortableHead({
  label,
  sorted,
  onClick,
  align = "left",
}: {
  label: string;
  sorted: false | "asc" | "desc";
  onClick: (event: unknown) => void;
  align?: "left" | "right";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "label label-muted inline-flex items-center gap-1.5 transition-colors hover:text-ink",
        align === "right" && "flex-row-reverse",
      )}
    >
      {label}
      <ArrowUpDown
        className={cn("size-3", sorted && "text-accent")}
        strokeWidth={1.75}
      />
    </button>
  );
}

function InventoryCell({ value }: { value: number }) {
  const tone =
    value === 0
      ? "text-critical"
      : value < 25
        ? "text-warning"
        : "text-ink-muted";
  return (
    <span className={cn("font-mono text-sm tabular-nums", tone)}>
      {formatNumber(value)}
    </span>
  );
}

export function ProductsClient() {
  const { data, isLoading } = useProducts();
  const [search, setSearch] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "revenueCents", desc: true },
  ]);

  const rows = React.useMemo<ProductPerformance[]>(() => {
    const all = data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.collectionSlug.toLowerCase().includes(q),
    );
  }, [data, search]);

  const columns = React.useMemo<ColumnDef<ProductPerformance>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Product",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {row.original.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={row.original.images[0]}
                alt=""
                className="size-9 shrink-0 border border-hairline object-cover"
              />
            ) : (
              <span className="size-9 shrink-0 border border-hairline bg-paper" />
            )}
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm text-ink">{row.original.name}</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                {row.original.collectionSlug}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <ProductStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "priceCents",
        header: "Price",
        cell: ({ row }) => (
          <span className="font-mono text-sm tabular-nums text-ink-muted">
            {formatCurrency(row.original.priceCents, row.original.currency)}
          </span>
        ),
      },
      {
        accessorKey: "unitsSold",
        header: "Units",
        cell: ({ row }) => (
          <span className="font-mono text-sm tabular-nums text-ink">
            {formatNumber(row.original.unitsSold)}
          </span>
        ),
      },
      {
        accessorKey: "ordersCount",
        header: "Orders",
        cell: ({ row }) => (
          <span className="font-mono text-sm tabular-nums text-ink-muted">
            {formatNumber(row.original.ordersCount)}
          </span>
        ),
      },
      {
        accessorKey: "inventory",
        header: "Inventory",
        cell: ({ row }) => <InventoryCell value={row.original.inventory} />,
      },
      {
        accessorKey: "revenueCents",
        header: "Revenue",
        cell: ({ row }) => (
          <span className="font-mono text-sm tabular-nums text-ink">
            {formatCurrency(row.original.revenueCents, row.original.currency)}
          </span>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (p) => p.id,
  });

  const rightAlignedIds = new Set([
    "priceCents",
    "unitsSold",
    "ordersCount",
    "inventory",
    "revenueCents",
  ]);

  return (
    <div className="flex flex-col gap-5">
      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
        <Input
          type="search"
          placeholder="Search product or collection…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          data-testid="products-search"
        />
      </div>

      <div className="border border-hairline bg-card">
        <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
          <span className="label label-muted">
            {isLoading
              ? "Loading…"
              : `${formatNumber(rows.length)} product${rows.length === 1 ? "" : "s"}`}
          </span>
          <span className="label label-muted">Best sellers first</span>
        </div>

        <Table data-testid="products-table">
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((header) => {
                  const right = rightAlignedIds.has(header.column.id);
                  return (
                    <TableHead
                      key={header.id}
                      className={right ? "text-right" : undefined}
                    >
                      {header.isPlaceholder ? null : (
                        <SortableHead
                          label={
                            flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            ) as unknown as string
                          }
                          sorted={header.column.getIsSorted()}
                          onClick={header.column.getToggleSortingHandler()!}
                          align={right ? "right" : "left"}
                        />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  {columns.map((_, c) => (
                    <TableCell key={c}>
                      <Skeleton className="h-4 w-full max-w-[7rem]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <span className="label label-muted">No products match</span>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-testid="products-row">
                  {row.getVisibleCells().map((cell) => {
                    const right = rightAlignedIds.has(cell.column.id);
                    return (
                      <TableCell
                        key={cell.id}
                        className={right ? "text-right" : undefined}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
