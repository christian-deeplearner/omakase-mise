import { getOrders, getProducts } from "@/lib/data-layer";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * A product enriched with realized sales performance, computed from the same
 * in-memory orders the rest of the console reads. Units/revenue reflect live
 * orders created via storefront checkout.
 */
export interface ProductPerformance extends Product {
  unitsSold: number;
  revenueCents: number;
  ordersCount: number;
}

/** GET /api/dashboard/products → ProductPerformance[] (best sellers first) */
export async function GET(): Promise<Response> {
  const products = getProducts();
  const orders = getOrders();

  const stats = new Map<string, { units: number; revenue: number; orders: number }>();
  for (const order of orders) {
    if (order.status === "refunded" || order.status === "cancelled") continue;
    const seen = new Set<string>();
    for (const item of order.items) {
      const s = stats.get(item.productId) ?? { units: 0, revenue: 0, orders: 0 };
      s.units += item.quantity;
      s.revenue += item.priceCents * item.quantity;
      if (!seen.has(item.productId)) {
        s.orders += 1;
        seen.add(item.productId);
      }
      stats.set(item.productId, s);
    }
  }

  const enriched: ProductPerformance[] = products.map((p) => {
    const s = stats.get(p.id) ?? { units: 0, revenue: 0, orders: 0 };
    return {
      ...p,
      unitsSold: s.units,
      revenueCents: s.revenue,
      ordersCount: s.orders,
    };
  });

  enriched.sort((a, b) => b.revenueCents - a.revenueCents);
  return Response.json(enriched);
}
