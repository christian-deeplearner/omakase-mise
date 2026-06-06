// The in-memory store. Built ONCE per process from the seed modules, in a
// fixed order (collections → products → customers → orders → events) so the
// deterministic faker stream is stable. Holds mutable arrays so a storefront
// checkout (createOrder) appears in the command-center Orders list within the
// same running dev server — without any real database.

import type {
  Collection,
  Customer,
  FunnelStage,
  Kpis,
  Order,
  OrderItem,
  Product,
} from "@/lib/types";
import { reseed, makeId, isoDaysAgo, REFERENCE_NOW } from "./seed";
import { getCollectionsSeed } from "./collections";
import { getProductsSeed } from "./products";
import { getCustomersSeed } from "./customers";
import { getOrdersSeed, priceOrder, ORDER_CONSTANTS } from "./orders";
import { getEventsSeed } from "./events";
import {
  computeKpis,
  computeFunnel,
  computeActivity,
  type ActivityItem,
} from "./kpis";
import type { StoreEvent } from "@/lib/types";

type World = {
  collections: Collection[];
  products: Product[];
  customers: Customer[];
  orders: Order[];
  events: StoreEvent[];
  // running counter for OMK- order numbers created at runtime
  nextOrderNumber: number;
};

function buildWorld(): World {
  // Re-seed before building so a fresh import always starts from MASTER_SEED.
  reseed();

  const collections = getCollectionsSeed();
  const products = getProductsSeed();
  const baseCustomers = getCustomersSeed();
  // orders reconciles customer aggregates and returns the corrected customers.
  const { orders, customers } = getOrdersSeed(products, baseCustomers);
  const events = getEventsSeed(products, customers);

  return {
    collections,
    products,
    customers,
    orders,
    events,
    nextOrderNumber: ORDER_CONSTANTS.ORDER_NUMBER_START + ORDER_CONSTANTS.ORDER_COUNT,
  };
}

// ── Singleton across module reloads ────────────────────────────────────────
// Next.js dev re-evaluates modules on HMR; stash the world on globalThis so a
// runtime-created order survives a hot reload within the same dev session.
const GLOBAL_KEY = "__OMAKASE_WORLD__";
type GlobalWithWorld = typeof globalThis & { [GLOBAL_KEY]?: World };
const g = globalThis as GlobalWithWorld;

function world(): World {
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = buildWorld();
  }
  return g[GLOBAL_KEY]!;
}

// ── Public data API ─────────────────────────────────────────────────────────

export function getCollections(): Collection[] {
  return world().collections;
}

export function getCollection(slug: string): Collection | undefined {
  return world().collections.find((c) => c.slug === slug);
}

export type ProductQuery = {
  collectionSlug?: string;
  status?: Product["status"];
  limit?: number;
};

export function getProducts(opts: ProductQuery = {}): Product[] {
  let list = world().products;
  if (opts.collectionSlug) list = list.filter((p) => p.collectionSlug === opts.collectionSlug);
  if (opts.status) list = list.filter((p) => p.status === opts.status);
  if (typeof opts.limit === "number") list = list.slice(0, opts.limit);
  return list;
}

export function getProduct(slug: string): Product | undefined {
  return world().products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return world().products.find((p) => p.id === id);
}

export type CustomerQuery = {
  limit?: number;
};

export function getCustomers(opts: CustomerQuery = {}): Customer[] {
  let list = world().customers;
  if (typeof opts.limit === "number") list = list.slice(0, opts.limit);
  return list;
}

export function getCustomer(id: string): Customer | undefined {
  return world().customers.find((c) => c.id === id);
}

export type OrderQuery = {
  status?: Order["status"];
  customerId?: string;
  limit?: number;
};

export function getOrders(opts: OrderQuery = {}): Order[] {
  // Orders are kept newest-first; createOrder unshifts new ones to the front.
  let list = world().orders;
  if (opts.status) list = list.filter((o) => o.status === opts.status);
  if (opts.customerId) list = list.filter((o) => o.customerId === opts.customerId);
  if (typeof opts.limit === "number") list = list.slice(0, opts.limit);
  return list;
}

export function getOrder(id: string): Order | undefined {
  return world().orders.find((o) => o.id === id);
}

// Input accepted from a storefront checkout. We resolve product details and
// pricing server-side so the client can't dictate price.
export type CreateOrderInput = {
  customerId?: string;
  customerName: string;
  customerEmail: string;
  items: { productId: string; quantity: number }[];
  channel?: Order["channel"];
};

/**
 * Append a new order to the in-memory list and return it. The order shows up
 * in getOrders() / the command center immediately within the same process.
 * Also updates the buyer's aggregates so customer LTV stays consistent.
 */
export function createOrder(input: CreateOrderInput): Order {
  const w = world();

  const items: OrderItem[] = input.items.map((line) => {
    const product = w.products.find((p) => p.id === line.productId);
    if (!product) {
      throw new Error(`createOrder: unknown productId "${line.productId}"`);
    }
    const quantity = Math.max(1, Math.floor(line.quantity));
    return {
      productId: product.id,
      name: product.name,
      quantity,
      priceCents: product.priceCents,
    };
  });

  if (items.length === 0) {
    throw new Error("createOrder: at least one item is required");
  }

  const { subtotalCents, shippingCents, totalCents } = priceOrder(items);

  // Resolve or synthesize the customer.
  let customerId = input.customerId;
  if (customerId && !w.customers.some((c) => c.id === customerId)) {
    customerId = undefined;
  }
  if (!customerId) {
    customerId = makeId("cus");
    const newCustomer: Customer = {
      id: customerId,
      name: input.customerName,
      email: input.customerEmail.toLowerCase(),
      location: "—",
      createdAt: isoDaysAgo(0),
      ordersCount: 0,
      ltvCents: 0,
      lastOrderAt: null,
    };
    w.customers.unshift(newCustomer);
  }

  const createdAt = new Date().toISOString();
  const order: Order = {
    id: makeId("ord"),
    number: `OMK-${w.nextOrderNumber++}`,
    customerId,
    customerName: input.customerName,
    customerEmail: input.customerEmail.toLowerCase(),
    items,
    subtotalCents,
    shippingCents,
    totalCents,
    currency: "USD",
    status: "paid",
    channel: input.channel ?? "web",
    createdAt,
  };

  // Newest-first.
  w.orders.unshift(order);

  // Update buyer aggregates.
  const buyer = w.customers.find((c) => c.id === customerId);
  if (buyer) {
    buyer.ordersCount += 1;
    buyer.ltvCents += totalCents;
    buyer.lastOrderAt = createdAt;
  }

  return order;
}

// ── Analytics (recomputed on demand so live orders are reflected) ───────────

export function getKpis(): Kpis {
  const w = world();
  // Use real wall-clock "now" extended past REFERENCE_NOW so a live order
  // created today still counts as "today". We pass the later of the two.
  const now = new Date();
  const ref = now > REFERENCE_NOW ? now : REFERENCE_NOW;
  return computeKpis(w.orders, w.events, ref);
}

export function getFunnel(): FunnelStage[] {
  return computeFunnel(world().events);
}

export function getActivity(limit = 40): ActivityItem[] {
  const w = world();
  return computeActivity(w.orders, w.events, limit);
}

// Exposed for the fixtures script (raw snapshot without query wrappers).
export function snapshotWorld(): {
  collections: Collection[];
  products: Product[];
  customers: Customer[];
  orders: Order[];
} {
  const w = world();
  return {
    collections: w.collections,
    products: w.products,
    customers: w.customers,
    orders: w.orders,
  };
}

export type { ActivityItem };
