// ─────────────────────────────────────────────────────────────────────────
// THE SEAM.
//
// This file is the single boundary between Omakase's UI and its "backend".
// Today the backend is a deterministic in-memory fake (./fake/store). In a
// real deployment, swapping to ClickHouse (events/KPIs), Stripe (orders/
// payments), and Shopify (catalog/customers) is a ONE-FILE change: keep these
// exported function signatures identical and re-point them at the real
// services. Nothing in the storefront or command center imports from ./fake
// directly — they only ever import from "@/lib/data-layer".
//
// That is the teaching point: clean seams make "fake now, real later" a
// mechanical swap instead of a rewrite.
// ─────────────────────────────────────────────────────────────────────────

export {
  // catalog
  getCollections,
  getCollection,
  getProducts,
  getProduct,
  getProductById,
  // customers
  getCustomers,
  getCustomer,
  // orders
  getOrders,
  getOrder,
  createOrder,
  // analytics
  getKpis,
  getFunnel,
  getActivity,
  // fixtures helper
  snapshotWorld,
} from "./fake/store";

export type {
  ProductQuery,
  CustomerQuery,
  OrderQuery,
  CreateOrderInput,
  ActivityItem,
} from "./fake/store";
