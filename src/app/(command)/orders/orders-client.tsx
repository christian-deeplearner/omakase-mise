"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, Search } from "lucide-react";

import { OrderStatusBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOrders } from "@/hooks/use-orders";
import type { Order, OrderStatus } from "@/lib/types";
import { cn, formatCurrency, formatDate, formatNumber } from "@/lib/utils";

const STATUS_OPTIONS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "fulfilled", label: "Fulfilled" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "refunded", label: "Refunded" },
  { value: "cancelled", label: "Cancelled" },
];

const CHANNEL_LABEL: Record<Order["channel"], string> = {
  web: "Web",
  wholesale: "Wholesale",
  pos: "POS",
};

function itemCount(order: Order): number {
  return order.items.reduce((sum, i) => sum + i.quantity, 0);
}

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

export function OrdersClient() {
  const router = useRouter();
  const [status, setStatus] = React.useState<OrderStatus | "all">("all");
  const [search, setSearch] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  const { data, isLoading } = useOrders(
    status === "all" ? {} : { status },
  );

  const rows = React.useMemo<Order[]>(() => {
    const all = data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (o) =>
        o.number.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q),
    );
  }, [data, search]);

  const columns = React.useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: "number",
        header: "Order",
        cell: ({ row }) => (
          <Link
            href={`/orders/${row.original.id}`}
            className="font-mono text-xs tabular-nums text-ink underline-offset-4 hover:text-accent hover:underline"
            data-testid="orders-row-link"
            onClick={(e) => e.stopPropagation()}
          >
            {row.original.number}
          </Link>
        ),
      },
      {
        accessorKey: "customerName",
        header: "Customer",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm text-ink">{row.original.customerName}</span>
            <span className="font-mono text-[11px] text-ink-muted">
              {row.original.customerEmail}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "channel",
        header: "Channel",
        cell: ({ row }) => (
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
            {CHANNEL_LABEL[row.original.channel]}
          </span>
        ),
      },
      {
        id: "items",
        accessorFn: (o) => itemCount(o),
        header: "Items",
        cell: ({ getValue }) => (
          <span className="font-mono text-sm tabular-nums text-ink-muted">
            {formatNumber(getValue<number>())}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "createdAt",
        header: "Placed",
        cell: ({ row }) => (
          <span className="whitespace-nowrap font-mono text-xs text-ink-muted">
            {formatDate(row.original.createdAt)}
          </span>
        ),
        sortingFn: "datetime",
      },
      {
        accessorKey: "totalCents",
        header: "Total",
        cell: ({ row }) => (
          <span className="font-mono text-sm tabular-nums text-ink">
            {formatCurrency(row.original.totalCents, row.original.currency)}
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
    getRowId: (o) => o.id,
  });

  const rightAlignedIds = new Set(["items", "totalCents"]);

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
          <Input
            type="search"
            placeholder="Search order #, name, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="orders-search"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="label label-muted hidden sm:inline">Status</span>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as OrderStatus | "all")}
          >
            <SelectTrigger
              className="w-full sm:w-48"
              data-testid="orders-status-filter"
              aria-label="Filter by status"
            >
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  data-testid={`orders-status-option-${opt.value}`}
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-hairline bg-card">
        <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
          <span className="label label-muted" data-testid="orders-count">
            {isLoading
              ? "Loading…"
              : `${formatNumber(rows.length)} order${rows.length === 1 ? "" : "s"}`}
          </span>
          <span className="label label-muted">Newest first</span>
        </div>

        <Table data-testid="orders-table">
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const right = rightAlignedIds.has(header.column.id);
                  return (
                    <TableHead
                      key={header.id}
                      className={right ? "text-right" : undefined}
                    >
                      {header.isPlaceholder ? null : canSort ? (
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
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
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
                      <Skeleton className="h-4 w-full max-w-[8rem]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  <span className="label label-muted">No orders match</span>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-testid="orders-row"
                  className="cursor-pointer"
                  onClick={() => router.push(`/orders/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => {
                    const right = rightAlignedIds.has(cell.column.id);
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(right && "text-right")}
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
