import { getKpis } from "@/lib/data-layer";

// KPIs are recomputed on demand so a live storefront order is reflected.
export const dynamic = "force-dynamic";

/** GET /api/dashboard/kpis → Kpis */
export async function GET(): Promise<Response> {
  return Response.json(getKpis());
}
