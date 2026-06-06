// ~300 orders over the last 60 days. Each order references REAL generated
// product + customer ids, computes its own subtotal/shipping/total, and carries
// a human order number (OMK-10001…). After building, we reconcile customer
// aggregates (ordersCount / ltvCents / lastOrderAt) against these orders.

import type { Customer, Order, OrderItem, OrderStatus, Product } from "@/lib/types";
import { faker, makeId, isoDaysAgo, weightedPick } from "./seed";

const ORDER_COUNT = 300;
const ORDER_WINDOW_DAYS = 60;
const ORDER_NUMBER_START = 10001;
const FREE_SHIPPING_THRESHOLD_CENTS = 20000;
const FLAT_SHIPPING_CENTS = 1200;

const STATUSES: readonly OrderStatus[] = [
  "delivered",
  "shipped",
  "fulfilled",
  "paid",
  "pending",
  "refunded",
  "cancelled",
];
// Weighted so most orders are happily completed; a realistic tail of
// refunds/cancellations for the command-center to surface.
const STATUS_WEIGHTS = [40, 18, 14, 12, 8, 5, 3];

const CHANNELS = ["web", "wholesale", "pos"] as const;
const CHANNEL_WEIGHTS = [82, 11, 7];

function buildItems(products: Product[]): OrderItem[] {
  // Only sell purchasable (non-archived) products.
  const sellable = products.filter((p) => p.status !== "archived");
  const lineCount = weightedPick([1, 2, 3, 4], [55, 28, 12, 5]);
  const chosen = faker.helpers.arrayElements(sellable, lineCount);

  return chosen.map((p) => {
    const quantity = weightedPick([1, 2, 3], [78, 17, 5]);
    return {
      productId: p.id,
      name: p.name,
      quantity,
      priceCents: p.priceCents,
    } satisfies OrderItem;
  });
}

type BuildResult = {
  orders: Order[];
  customers: Customer[];
};

/**
 * Build orders against real products/customers and return BOTH the orders and
 * a customers array with reconciled aggregates. Generation order is fixed for
 * determinism.
 */
function buildOrders(products: Product[], customersIn: Customer[]): BuildResult {
  // Mutable working copies of customer aggregates, keyed by id.
  const agg = new Map<
    string,
    { ordersCount: number; ltvCents: number; lastOrderAt: string | null }
  >();
  for (const c of customersIn) {
    agg.set(c.id, { ordersCount: 0, ltvCents: 0, lastOrderAt: null });
  }

  const orders: Order[] = Array.from({ length: ORDER_COUNT }, (_, i) => {
    const customer = faker.helpers.arrayElement(customersIn);
    const items = buildItems(products);

    const subtotalCents = items.reduce(
      (sum, it) => sum + it.priceCents * it.quantity,
      0,
    );
    const shippingCents =
      subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : FLAT_SHIPPING_CENTS;
    const totalCents = subtotalCents + shippingCents;

    const status = weightedPick<OrderStatus>(STATUSES, STATUS_WEIGHTS);
    const channel = weightedPick(CHANNELS, CHANNEL_WEIGHTS);

    const createdDaysAgo = faker.number.int({ min: 0, max: ORDER_WINDOW_DAYS });
    const createdAt = isoDaysAgo(createdDaysAgo);

    const order: Order = {
      id: makeId("ord"),
      number: `OMK-${ORDER_NUMBER_START + i}`,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      items,
      subtotalCents,
      shippingCents,
      totalCents,
      currency: "USD",
      status,
      channel,
      createdAt,
    };

    // Reconcile customer aggregates. Refunded/cancelled don't count toward LTV.
    const counts = status !== "refunded" && status !== "cancelled";
    if (counts) {
      const a = agg.get(customer.id)!;
      a.ordersCount += 1;
      a.ltvCents += totalCents;
      if (!a.lastOrderAt || createdAt > a.lastOrderAt) {
        a.lastOrderAt = createdAt;
      }
    }

    return order;
  });

  // Sort newest-first so default order lists read like a real dashboard.
  orders.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  // Produce reconciled customers.
  const customers: Customer[] = customersIn.map((c) => {
    const a = agg.get(c.id)!;
    return {
      ...c,
      ordersCount: a.ordersCount,
      ltvCents: a.ltvCents,
      lastOrderAt: a.lastOrderAt,
    } satisfies Customer;
  });

  return { orders, customers };
}

export function getOrdersSeed(products: Product[], customers: Customer[]): BuildResult {
  return buildOrders(products, customers);
}

/**
 * Compute shipping/total for a brand-new order created at runtime (storefront
 * checkout). Shared helper so the live path matches the seeded path exactly.
 */
export function priceOrder(items: OrderItem[]): {
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
} {
  const subtotalCents = items.reduce(
    (sum, it) => sum + it.priceCents * it.quantity,
    0,
  );
  const shippingCents =
    subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : FLAT_SHIPPING_CENTS;
  return { subtotalCents, shippingCents, totalCents: subtotalCents + shippingCents };
}

export const ORDER_CONSTANTS = {
  ORDER_NUMBER_START,
  ORDER_COUNT,
  FREE_SHIPPING_THRESHOLD_CENTS,
  FLAT_SHIPPING_CENTS,
};
