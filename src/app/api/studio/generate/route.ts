// POST /api/studio/generate
// The creative-review generate action. Validates the brief, then calls the
// creative pipeline (src/lib/creative) to build the 7-part Omakase prompt,
// render N variants — real via fal.ai if FAL_KEY is in the SERVER env, else the
// deterministic offline stub — score each with the art-director heuristic, and
// write them to the canonical /public/images paths.
//
// The fal credential is read inside the pipeline from process.env; it is never
// part of the request, the response, or any log line.

import { NextResponse } from "next/server";
import { z } from "zod";

import { generateVariants, type CreativeBrief } from "@/lib/creative";

export const dynamic = "force-dynamic";
// Image bytes can take a moment from a real model; give the route headroom.
export const maxDuration = 120;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const GenerateSchema = z.object({
  kind: z.enum(["hero", "collection", "product"]),
  subject: z.string().trim().min(1, "A subject is required").max(160),
  slug: z
    .string()
    .trim()
    .min(1, "A slug is required")
    .max(80)
    .regex(SLUG_RE, "Slug must be kebab-case"),
  styleNotes: z.string().trim().max(400).optional(),
  character: z.string().trim().max(200).optional(),
  count: z.number().int().min(1).max(4).optional(),
});

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = GenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const { kind, subject, slug, styleNotes, character, count } = parsed.data;
  // Hero pins to the canonical "hero" slug regardless of what was sent.
  const brief: CreativeBrief = {
    kind,
    subject,
    slug: kind === "hero" ? "hero" : slug,
    styleNotes,
    character,
  };

  try {
    const result = await generateVariants(brief, count ?? 2);
    // Strip absolutePath from the response — the client only needs the public
    // path. (Disk layout is a server detail.)
    return NextResponse.json({
      brief: result.brief,
      live: result.live,
      variants: result.variants.map((v) => ({
        id: v.id,
        path: v.path,
        prompt: v.prompt,
        score: v.score,
        source: v.source,
      })),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
