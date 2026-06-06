// Pure analytics functions over the generated data. No randomness, no mutable
// state — given the same orders/events they always return the same Kpis,
// funnel, and activity feed. The command center reads these directly.

import type {
  FunnelStage,
  Kpis,
  Order,
  StoreEvent,
  StoreEventType,
} from "@/lib/types";
import { REFERENCE_NOW } from "./seed";

const DAY_MS = 24 * 60 * 60 * 1000;

// Orders in these states represent realized revenue.
function isRevenueOrder(o: Order): boolean {
  return o.status !== "refunded" && o.status !== "cancelled";
}

function withinDays(iso: string, days: number, now: Date): boolean {
  const t = new Date(iso).getTime();
  return now.getTime() - t <= days * DAY_MS && t <= now.getTime();
}

function isSameUtcDay(iso: string, now: Date): boolean {
  const d = new Date(iso);
  return (
    d.getUTCFullYear() === now.getUTCFullYear() &&
    d.getUTCMonth() === now.getUTCMonth() &&
    d.getUTCDate() === now.getUTCDate()
  );
}

/**
 * Headline KPIs for the command center dashboard.
 */
export function computeKpis(
  orders: Order[],
  events: StoreEvent[],
  now: Date = REFERENCE_NOW,
): Kpis {
  const revenueOrders = orders.filter(isRevenueOrder);

  const ordersToday = revenueOrders.filter((o) => isSameUtcDay(o.createdAt, now)).length;

  const revenue7dCents = revenueOrders
    .filter((o) => withinDays(o.createdAt, 7, now))
    .reduce((sum, o) => sum + o.totalCents, 0);

  const revenue30dCents = revenueOrders
    .filter((o) => withinDays(o.createdAt, 30, now))
    .reduce((sum, o) => sum + o.totalCents, 0);

  // Sessions in the last 7 days = unique sessionIds with a page_view.
  const sessions7d = new Set<string>();
  const purchaseSessions = new Set<string>();
  const cartSessions = new Set<string>();
  const allSessions = new Set<string>();

  for (const e of events) {
    if (!withinDays(e.ts, 30, now)) continue;
    allSessions.add(e.sessionId);
    if (e.type === "add_to_cart") cartSessions.add(e.sessionId);
    if (e.type === "purchase") purchaseSessions.add(e.sessionId);
    if (e.type === "page_view" && withinDays(e.ts, 7, now)) sessions7d.add(e.sessionId);
  }

  const visitors7d = sessions7d.size;

  // Conversion = purchasing sessions / all sessions (30d window for stability).
  const conversionRate =
    allSessions.size === 0 ? 0 : purchaseSessions.size / allSessions.size;

  // Abandonment = carts that never purchased / carts.
  const abandonedCarts = [...cartSessions].filter((s) => !purchaseSessions.has(s)).length;
  const cartAbandonmentRate =
    cartSessions.size === 0 ? 0 : abandonedCarts / cartSessions.size;

  const aovCents =
    revenueOrders.length === 0
      ? 0
      : Math.round(
          revenueOrders.reduce((sum, o) => sum + o.totalCents, 0) / revenueOrders.length,
        );

  return {
    ordersToday,
    revenue7dCents,
    revenue30dCents,
    conversionRate,
    cartAbandonmentRate,
    visitors7d,
    aovCents,
  };
}

const FUNNEL_ORDER: { type: StoreEventType; stage: string }[] = [
  { type: "page_view", stage: "Visit" },
  { type: "product_view", stage: "Product View" },
  { type: "add_to_cart", stage: "Add to Cart" },
  { type: "checkout_start", stage: "Checkout" },
  { type: "purchase", stage: "Purchase" },
];

/**
 * Funnel by UNIQUE sessions reaching each stage (last 30 days). Counting
 * sessions (not raw events) makes the funnel monotonically decreasing and
 * directly readable as drop-off.
 */
export function computeFunnel(
  events: StoreEvent[],
  now: Date = REFERENCE_NOW,
): FunnelStage[] {
  const sessionsByType = new Map<StoreEventType, Set<string>>();
  for (const { type } of FUNNEL_ORDER) sessionsByType.set(type, new Set());

  for (const e of events) {
    if (!withinDays(e.ts, 30, now)) continue;
    const set = sessionsByType.get(e.type);
    if (set) set.add(e.sessionId);
  }

  return FUNNEL_ORDER.map(({ type, stage }) => ({
    stage,
    count: sessionsByType.get(type)!.size,
  }));
}

export type ActivityItem = {
  id: string;
  kind: "order" | StoreEventType;
  label: string;
  detail: string;
  amountCents: number | null;
  ts: string;
};

/**
 * A merged, newest-first activity feed blending orders and notable events.
 * Used by the command-center "live" panel.
 */
export function computeActivity(
  orders: Order[],
  events: StoreEvent[],
  limit = 40,
): ActivityItem[] {
  const orderItems: ActivityItem[] = orders.map((o) => ({
    id: o.id,
    kind: "order",
    label: `Order ${o.number}`,
    detail: `${o.customerName} · ${o.status}`,
    amountCents: o.totalCents,
    ts: o.createdAt,
  }));

  // Only surface high-signal events in the feed (not raw page views).
  const eventLabels: Partial<Record<StoreEventType, string>> = {
    purchase: "Purchase",
    checkout_start: "Checkout started",
    add_to_cart: "Added to cart",
  };

  const eventItems: ActivityItem[] = events
    .filter((e) => e.type in eventLabels)
    .map((e) => ({
      id: e.id,
      kind: e.type,
      label: eventLabels[e.type]!,
      detail: e.customerId ? "Known visitor" : "Anonymous visitor",
      amountCents: null,
      ts: e.ts,
    }));

  return [...orderItems, ...eventItems]
    .sort((a, b) => (a.ts < b.ts ? 1 : a.ts > b.ts ? -1 : 0))
    .slice(0, limit);
}
