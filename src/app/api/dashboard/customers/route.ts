import { getCustomers } from "@/lib/data-layer";
import type { Customer } from "@/lib/types";

export const dynamic = "force-dynamic";

/** GET /api/dashboard/customers?q=&limit= → Customer[] (highest LTV first) */
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.max(1, Number(limitParam) || 0) || undefined : undefined;

  let customers: Customer[] = getCustomers();

  if (q) {
    customers = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q),
    );
  }

  customers = [...customers].sort((a, b) => b.ltvCents - a.ltvCents);
  if (limit) customers = customers.slice(0, limit);

  return Response.json(customers);
}
