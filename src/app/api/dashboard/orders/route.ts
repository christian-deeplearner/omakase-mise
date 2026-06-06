import { getOrders } from "@/lib/data-layer";
import type { OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const ORDER_STATUSES: ReadonlySet<OrderStatus> = new Set([
  "pending",
  "paid",
  "fulfilled",
  "shipped",
  "delivered",
  "refunded",
  "cancelled",
]);

function asStatus(v: string | null): OrderStatus | undefined {
  return v && ORDER_STATUSES.has(v as OrderStatus) ? (v as OrderStatus) : undefined;
}

/** GET /api/dashboard/orders?status=&customerId=&limit= → Order[] */
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const status = asStatus(searchParams.get("status"));
  const customerId = searchParams.get("customerId") ?? undefined;
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.max(1, Number(limitParam) || 0) || undefined : undefined;

  return Response.json(getOrders({ status, customerId, limit }));
}
