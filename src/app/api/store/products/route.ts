// GET /api/store/products
// Thin handler over the data-layer. Supports ?collection=<slug>,
// ?status=<status>, and ?limit=<n>. Server components read the data-layer
// directly; this exists for client components (and external demos).

import { NextResponse } from "next/server";
import { getProducts } from "@/lib/data-layer";
import type { Product } from "@/lib/types";

export function GET(request: Request): NextResponse {
  const { searchParams } = new URL(request.url);

  const collectionSlug = searchParams.get("collection") ?? undefined;
  const statusParam = searchParams.get("status");
  const limitParam = searchParams.get("limit");

  const validStatuses: Product["status"][] = [
    "active",
    "archived",
    "coming-soon",
  ];
  const status =
    statusParam && validStatuses.includes(statusParam as Product["status"])
      ? (statusParam as Product["status"])
      : undefined;

  const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;

  const products = getProducts({
    collectionSlug,
    status,
    limit: Number.isFinite(limit) ? limit : undefined,
  });

  return NextResponse.json({ products });
}
