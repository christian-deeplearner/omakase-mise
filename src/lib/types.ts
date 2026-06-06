// Shared domain types for Omakase — used by the fake-data layer, API routes,
// the storefront, and the command center. One source of truth.

export type Collection = {
  slug: string;
  name: string;
  glyph: string; // a single mark/character shown in editorial list rows
  tagline: string; // poetic one-liner (GAOCHAO style)
  description: string;
  image?: string; // local hero image, served at /images/collections/<slug>.jpg
};

export type ProductStatus = "active" | "archived" | "coming-soon";

export type Product = {
  id: string;
  slug: string;
  name: string;
  collectionSlug: string;
  priceCents: number;
  currency: string;
  images: string[]; // public paths or remote urls (fake)
  description: string;
  sizes: string[];
  status: ProductStatus;
  inventory: number;
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "fulfilled"
  | "shipped"
  | "delivered"
  | "refunded"
  | "cancelled";

export type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  priceCents: number;
};

export type Order = {
  id: string;
  number: string; // human order number e.g. OMK-10231
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  currency: string;
  status: OrderStatus;
  channel: "web" | "wholesale" | "pos";
  createdAt: string; // ISO
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  location: string;
  createdAt: string;
  ordersCount: number;
  ltvCents: number;
  lastOrderAt: string | null;
};

export type StoreEventType =
  | "page_view"
  | "product_view"
  | "add_to_cart"
  | "checkout_start"
  | "purchase"
  | "search";

export type StoreEvent = {
  id: string;
  type: StoreEventType;
  customerId: string | null;
  productId: string | null;
  sessionId: string;
  ts: string; // ISO
  device: "desktop" | "mobile" | "tablet";
};

export type FunnelStage = {
  stage: string;
  count: number;
};

export type Kpis = {
  ordersToday: number;
  revenue7dCents: number;
  revenue30dCents: number;
  conversionRate: number; // 0..1
  cartAbandonmentRate: number; // 0..1
  visitors7d: number;
  aovCents: number; // average order value
};

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  size: string;
  quantity: number;
  image?: string;
};
