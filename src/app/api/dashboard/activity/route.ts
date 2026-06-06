import { getActivity } from "@/lib/data-layer";

export const dynamic = "force-dynamic";

/** GET /api/dashboard/activity?limit=40 → ActivityItem[] */
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.max(1, Math.min(200, Number(limitParam) || 40)) : 40;
  return Response.json(getActivity(limit));
}
