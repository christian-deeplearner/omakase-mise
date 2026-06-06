import { getFunnel } from "@/lib/data-layer";

export const dynamic = "force-dynamic";

/** GET /api/dashboard/funnel → FunnelStage[] */
export async function GET(): Promise<Response> {
  return Response.json(getFunnel());
}
