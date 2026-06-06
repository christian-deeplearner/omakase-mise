"use client";

import * as React from "react";
import {
  CreditCard,
  Eye,
  PackageCheck,
  Search,
  ShoppingBag,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { StoreEventType } from "@/lib/types";

export interface ActivityItem {
  id: string;
  /** Either a known store-event type (gets an icon) or a free "order". */
  kind: StoreEventType | "order";
  /** Primary line, e.g. "Order AUR-10231 · $480" or "Added Lumen Coat to cart". */
  title: string;
  /** Optional secondary line, e.g. customer name or location. */
  meta?: string;
  /** ISO timestamp; rendered as relative time. */
  ts: string;
}

export interface ActivityFeedProps
  extends React.HTMLAttributes<HTMLOListElement> {
  items: ActivityItem[];
  /** Cap how many rows render. Default: all. */
  limit?: number;
}

const ICON_BY_KIND: Record<ActivityItem["kind"], LucideIcon> = {
  page_view: Eye,
  product_view: Eye,
  add_to_cart: ShoppingCart,
  checkout_start: ShoppingBag,
  purchase: CreditCard,
  search: Search,
  order: PackageCheck,
};

const ACCENT_KINDS = new Set<ActivityItem["kind"]>([
  "purchase",
  "order",
  "checkout_start",
]);

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffSec = Math.round((Date.now() - then) / 1000);
  if (diffSec < 5) return "now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const min = Math.floor(diffSec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}

export function ActivityFeed({
  items,
  limit,
  className,
  ...props
}: ActivityFeedProps) {
  const rows = typeof limit === "number" ? items.slice(0, limit) : items;

  if (rows.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center border border-dashed border-hairline">
        <span className="label label-muted">No recent activity</span>
      </div>
    );
  }

  return (
    <ol className={cn("flex flex-col", className)} {...props}>
      {rows.map((item, i) => {
        const Icon = ICON_BY_KIND[item.kind];
        const accent = ACCENT_KINDS.has(item.kind);
        return (
          <li
            key={item.id}
            className={cn(
              "flex items-center gap-4 py-3",
              i > 0 && "border-t border-hairline",
            )}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center border",
                accent
                  ? "border-transparent bg-accent-soft text-accent"
                  : "border-hairline bg-paper text-ink-muted",
              )}
            >
              <Icon className="size-4" />
            </span>

            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm text-ink">{item.title}</span>
              {item.meta && (
                <span className="truncate font-mono text-[11px] tracking-[0.04em] text-ink-muted">
                  {item.meta}
                </span>
              )}
            </div>

            <time
              dateTime={item.ts}
              className="shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted tabular-nums"
            >
              {relativeTime(item.ts)}
            </time>
          </li>
        );
      })}
    </ol>
  );
}
