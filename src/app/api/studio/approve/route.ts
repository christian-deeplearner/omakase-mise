// POST /api/studio/approve  — record the chosen variant for a slug.
// GET  /api/studio/approve  — read the current slug → variantId approval map.
//
// Approval is a review action, not catalog state, so it lives in the creative
// pipeline's in-memory map (cleared when the process restarts).

import { NextResponse } from "next/server";
import { z } from "zod";

import { approveVariant, listApprovals } from "@/lib/creative";

export const dynamic = "force-dynamic";

const ApproveSchema = z.object({
  slug: z.string().trim().min(1).max(80),
  variantId: z.string().trim().min(1).max(120),
});

/** GET → { approvals: Record<slug, variantId> } */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ approvals: listApprovals() });
}

/** POST → { slug, variantId } */
export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = ApproveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const { slug, variantId } = parsed.data;
  const mapping = approveVariant(slug, variantId);
  return NextResponse.json(mapping, { status: 200 });
}
